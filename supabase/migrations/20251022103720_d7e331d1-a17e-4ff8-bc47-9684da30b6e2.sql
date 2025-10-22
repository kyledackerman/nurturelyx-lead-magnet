-- Update get_crm_prospects_with_stats to exclude ambassador domains
CREATE OR REPLACE FUNCTION public.get_crm_prospects_with_stats(
  p_status_filter text[] DEFAULT NULL::text[], 
  p_assigned_filter uuid DEFAULT NULL::uuid, 
  p_view text DEFAULT NULL::text, 
  p_lead_source text DEFAULT NULL::text, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  report_id uuid, 
  domain text, 
  slug text, 
  status text, 
  priority text, 
  assigned_to uuid, 
  lost_reason text, 
  lost_notes text, 
  icebreaker_text text, 
  contact_count bigint, 
  company_name text, 
  monthly_revenue numeric, 
  missed_leads integer, 
  traffic_tier text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  lead_source text, 
  enrichment_retry_count integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id, pa.report_id, r.domain, r.slug, pa.status, pa.priority,
    pa.assigned_to, pa.lost_reason, pa.lost_notes, pa.icebreaker_text,
    pa.contact_count::bigint, r.extracted_company_name,
    (r.report_data->>'monthlyRevenueLost')::numeric, (r.report_data->>'missedLeads')::integer,
    CASE
      WHEN (r.report_data->>'organicTraffic')::numeric < 10000 THEN 'low'
      WHEN (r.report_data->>'organicTraffic')::numeric < 100000 THEN 'medium'
      WHEN (r.report_data->>'organicTraffic')::numeric < 500000 THEN 'high'
      ELSE 'enterprise'
    END as traffic_tier,
    pa.created_at, pa.updated_at, pa.lead_source, pa.enrichment_retry_count
  FROM prospect_activities pa
  INNER JOIN reports r ON pa.report_id = r.id
  WHERE 
    (p_status_filter IS NULL OR pa.status = ANY(p_status_filter))
    AND (p_assigned_filter IS NULL OR pa.assigned_to = p_assigned_filter)
    AND (p_lead_source IS NULL OR pa.lead_source = p_lead_source)
    -- Exclude ambassador-submitted domains
    AND pa.purchased_by_ambassador IS NULL 
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
    AND (
      p_view IS NULL OR
      (p_view = 'new-prospects' AND pa.status = 'new') OR
      (p_view = 'enriching-now' AND pa.status = 'enriching' AND pa.enrichment_retry_count < 3) OR
      (p_view = 'warm-inbound' AND pa.lead_source = 'warm_inbound') OR
      (p_view = 'needs-attention' AND (pa.status = 'review' OR (pa.status = 'enriching' AND pa.enrichment_retry_count >= 1))) OR
      (p_view = 'ready-outreach' AND pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched') OR
      (p_view = 'active-pipeline' AND pa.status = 'contacted') OR
      (p_view = 'interested' AND pa.status IN ('interested', 'proposal')) OR
      (p_view = 'closed' AND pa.status IN ('closed_won', 'closed_lost'))
    )
  ORDER BY 
    CASE pa.lead_source WHEN 'warm_inbound' THEN 1 ELSE 2 END,
    CASE pa.priority WHEN 'hot' THEN 3 WHEN 'warm' THEN 2 WHEN 'cold' THEN 1 ELSE 0 END DESC,
    (r.report_data->>'monthlyRevenueLost')::numeric DESC NULLS LAST,
    pa.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;

-- Update get_crm_sidebar_counts to exclude ambassador domains
CREATE OR REPLACE FUNCTION public.get_crm_sidebar_counts()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH view_counts AS (
  -- New Prospects
  SELECT 'new-prospects'::text as view_name, COUNT(DISTINCT r.domain)::int as cnt
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'new'
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Enriching Now (active enrichment)
  SELECT 'enriching-now', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'enriching' AND pa.enrichment_retry_count < 3
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Warm Inbound
  SELECT 'warm-inbound', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.lead_source = 'warm_inbound'
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Needs Attention (terminal states + manual review)
  SELECT 'needs-attention', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE (pa.status = 'review' OR (pa.status = 'enriching' AND pa.enrichment_retry_count >= 1))
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Ready for Outreach
  SELECT 'ready-outreach', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched'
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Active Pipeline
  SELECT 'active-pipeline', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'contacted'
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Interested
  SELECT 'interested', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('interested', 'proposal')
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
  
  UNION ALL
  
  -- Closed
  SELECT 'closed', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('closed_won', 'closed_lost')
    AND pa.purchased_by_ambassador IS NULL
    AND (r.lead_source IS NULL OR r.lead_source != 'ambassador_submitted')
)
SELECT jsonb_object_agg(view_name, cnt)
FROM view_counts;
$function$;