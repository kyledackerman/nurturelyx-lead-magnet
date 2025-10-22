-- Phase 1: Critical Performance Indexes
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status 
ON prospect_activities(status);

CREATE INDEX IF NOT EXISTS idx_prospect_activities_lead_source 
ON prospect_activities(lead_source);

CREATE INDEX IF NOT EXISTS idx_prospect_activities_purchased_by 
ON prospect_activities(purchased_by_ambassador) 
WHERE purchased_by_ambassador IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prospect_activities_enrichment 
ON prospect_activities(status, enrichment_retry_count);

CREATE INDEX IF NOT EXISTS idx_prospect_activities_contacts 
ON prospect_activities(contact_count) 
WHERE contact_count > 0;

CREATE INDEX IF NOT EXISTS idx_prospect_activities_assigned 
ON prospect_activities(assigned_to) 
WHERE assigned_to IS NOT NULL;

-- Materialized View for Ambassador Dashboard Stats
CREATE MATERIALIZED VIEW ambassador_dashboard_stats AS
SELECT 
  ap.user_id,
  ap.full_name,
  ap.email,
  ap.active_domains_count,
  ap.total_signups_lifetime,
  ap.total_leads_processed,
  ap.pending_commission,
  ap.eligible_commission,
  ap.lifetime_commission_paid,
  ap.per_lead_tier,
  ap.platform_fee_tier,
  CASE 
    WHEN ap.total_domains_purchased > 0 
    THEN ROUND((ap.total_signups_lifetime::numeric / ap.total_domains_purchased) * 100, 1)
    ELSE 0
  END as conversion_rate,
  (
    SELECT MIN(c.eligible_for_payout_at)
    FROM commissions c
    WHERE c.ambassador_id = ap.user_id
      AND c.status = 'pending'
      AND c.eligible_for_payout_at IS NOT NULL
  ) as next_payout_date
FROM ambassador_profiles ap;

CREATE UNIQUE INDEX idx_amb_stats_user_id ON ambassador_dashboard_stats(user_id);

-- Optimized Leaderboard Function (Single Query)
CREATE OR REPLACE FUNCTION get_ambassador_leaderboard_optimized(
  p_metric text DEFAULT 'overall',
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  rank integer,
  ambassador_id uuid,
  ambassador_name text,
  ambassador_email text,
  total_signups integer,
  active_domains integer,
  retention_rate numeric,
  total_leads_processed integer,
  leads_per_domain numeric,
  estimated_revenue_recovered numeric,
  composite_score numeric,
  badges text[]
) AS $$
BEGIN
  RETURN QUERY
  WITH revenue_by_ambassador AS (
    SELECT 
      pa.purchased_by_ambassador,
      SUM((r.report_data->>'yearlyRevenueLost')::numeric) as total_revenue
    FROM prospect_activities pa
    INNER JOIN reports r ON pa.report_id = r.id
    WHERE pa.purchased_by_ambassador IS NOT NULL
      AND pa.status = 'closed_won'
    GROUP BY pa.purchased_by_ambassador
  ),
  metrics AS (
    SELECT 
      ap.user_id,
      ap.full_name,
      ap.email,
      ap.total_signups_lifetime,
      ap.active_domains_count,
      CASE 
        WHEN ap.total_signups_lifetime > 0 
        THEN ROUND((ap.active_domains_count::numeric / ap.total_signups_lifetime) * 100, 1)
        ELSE 0 
      END as retention_rate,
      ap.total_leads_processed,
      CASE 
        WHEN ap.active_domains_count > 0 
        THEN ROUND(ap.total_leads_processed::numeric / ap.active_domains_count, 1)
        ELSE 0 
      END as leads_per_domain,
      COALESCE(rba.total_revenue, 0) as estimated_revenue_recovered,
      (ap.total_signups_lifetime * 100) +
      (CASE WHEN ap.total_signups_lifetime > 0 THEN (ap.active_domains_count::numeric / ap.total_signups_lifetime) * 1000 ELSE 0 END) +
      (COALESCE(rba.total_revenue, 0) / 10000) +
      (CASE WHEN ap.active_domains_count > 0 THEN (ap.total_leads_processed::numeric / ap.active_domains_count) / 10 ELSE 0 END)
      as composite_score
    FROM ambassador_profiles ap
    LEFT JOIN revenue_by_ambassador rba ON ap.user_id = rba.purchased_by_ambassador
  ),
  sorted AS (
    SELECT 
      m.*,
      CASE 
        WHEN p_metric = 'signups' THEN ROW_NUMBER() OVER (ORDER BY m.total_signups DESC)
        WHEN p_metric = 'active_domains' THEN ROW_NUMBER() OVER (ORDER BY m.active_domains DESC)
        WHEN p_metric = 'retention' THEN ROW_NUMBER() OVER (ORDER BY m.retention_rate DESC)
        WHEN p_metric = 'leads_per_domain' THEN ROW_NUMBER() OVER (ORDER BY m.leads_per_domain DESC)
        WHEN p_metric = 'revenue_recovered' THEN ROW_NUMBER() OVER (ORDER BY m.estimated_revenue_recovered DESC)
        ELSE ROW_NUMBER() OVER (ORDER BY m.composite_score DESC)
      END as rank_num,
      ARRAY(
        SELECT badge FROM (
          SELECT 'Retention Master' as badge, 1 as ord WHERE m.retention_rate >= 90 AND m.total_signups >= 10
          UNION ALL SELECT 'Client Keeper', 2 WHERE m.retention_rate >= 80 AND m.total_signups >= 5
          UNION ALL SELECT 'Whale Hunter', 3 WHERE m.leads_per_domain >= 2000
          UNION ALL SELECT 'Big Fish', 4 WHERE m.leads_per_domain >= 1000
          UNION ALL SELECT 'Growth Machine', 5 WHERE m.total_signups >= 50
          UNION ALL SELECT 'Rising Star', 6 WHERE m.total_signups >= 25
          UNION ALL SELECT 'Revenue Champion', 7 WHERE m.estimated_revenue_recovered >= 5000000
          UNION ALL SELECT 'Money Maker', 8 WHERE m.estimated_revenue_recovered >= 1000000
        ) b ORDER BY ord
      ) as badges
    FROM metrics m
  )
  SELECT 
    s.rank_num::integer,
    s.user_id,
    s.full_name,
    s.email,
    s.total_signups,
    s.active_domains,
    s.retention_rate,
    s.total_leads_processed,
    s.leads_per_domain,
    s.estimated_revenue_recovered,
    s.composite_score,
    s.badges
  FROM sorted s
  WHERE s.rank_num <= p_limit
  ORDER BY s.rank_num;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;