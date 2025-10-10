-- Phase 1: Add composite indexes for common query patterns

-- Index for "ready for outreach" view (enriched status + has contacts + has icebreaker)
CREATE INDEX IF NOT EXISTS idx_prospect_activities_ready_outreach 
ON prospect_activities(status, contact_count, icebreaker_text) 
WHERE status = 'enriched' AND contact_count > 0 AND icebreaker_text IS NOT NULL;

-- Index for "needs enrichment" view (review status + no contacts)
CREATE INDEX IF NOT EXISTS idx_prospect_activities_needs_enrichment 
ON prospect_activities(status, contact_count) 
WHERE status IN ('enriched', 'review') AND contact_count = 0;

-- Index for status + assigned_to (common filter combination)
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status_assigned 
ON prospect_activities(status, assigned_to);

-- Index for pagination (updated_at DESC is common sort)
CREATE INDEX IF NOT EXISTS idx_prospect_activities_updated_at 
ON prospect_activities(updated_at DESC);

-- Optimize the get_crm_prospects_with_stats function with view parameter
CREATE OR REPLACE FUNCTION public.get_crm_prospects_with_stats(
  p_status_filter text[] DEFAULT NULL::text[],
  p_assigned_filter uuid DEFAULT NULL::uuid,
  p_view text DEFAULT NULL,
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
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.report_id,
    r.domain,
    r.slug,
    pa.status,
    pa.priority,
    pa.assigned_to,
    pa.lost_reason,
    pa.lost_notes,
    pa.icebreaker_text,
    pa.contact_count::bigint,
    r.extracted_company_name,
    (r.report_data->>'monthlyRevenueLost')::numeric,
    (r.report_data->>'missedLeads')::integer,
    CASE
      WHEN (r.report_data->>'organicTraffic')::numeric < 10000 THEN 'low'
      WHEN (r.report_data->>'organicTraffic')::numeric < 100000 THEN 'medium'
      WHEN (r.report_data->>'organicTraffic')::numeric < 500000 THEN 'high'
      ELSE 'enterprise'
    END as traffic_tier,
    pa.created_at,
    pa.updated_at
  FROM prospect_activities pa
  INNER JOIN reports r ON pa.report_id = r.id
  WHERE 
    (p_status_filter IS NULL OR pa.status = ANY(p_status_filter))
    AND (p_assigned_filter IS NULL OR pa.assigned_to = p_assigned_filter)
    AND (
      p_view IS NULL OR
      (p_view = 'needs-enrichment' AND pa.contact_count = 0 AND pa.status IN ('enriching', 'review')) OR
      (p_view = 'ready-outreach' AND pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched') OR
      (p_view = 'needs-review' AND pa.status = 'review') OR
      (p_view = 'new-prospects' AND pa.status = 'new') OR
      (p_view = 'active' AND pa.status IN ('contacted', 'proposal')) OR
      (p_view = 'closed' AND pa.status IN ('closed_won', 'closed_lost'))
    )
  ORDER BY 
    CASE pa.priority 
      WHEN 'hot' THEN 3
      WHEN 'warm' THEN 2
      WHEN 'cold' THEN 1
      ELSE 0
    END DESC,
    (r.report_data->>'monthlyRevenueLost')::numeric DESC NULLS LAST,
    pa.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;