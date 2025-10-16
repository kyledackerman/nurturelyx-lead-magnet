-- Create function to get sidebar counts for all CRM views
CREATE OR REPLACE FUNCTION public.get_crm_sidebar_counts()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH view_counts AS (
  -- warm-inbound
  SELECT 'warm-inbound'::text as view_name, COUNT(DISTINCT r.domain)::int as cnt
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.lead_source = 'warm_inbound'
  
  UNION ALL
  
  -- needs-review
  SELECT 'needs-review', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'review'
  
  UNION ALL
  
  -- missing-emails
  SELECT 'missing-emails', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status NOT IN ('closed_won', 'closed_lost', 'not_viable', 'enriched')
    AND pa.enrichment_retry_count >= 2
    AND EXISTS (SELECT 1 FROM prospect_contacts pc WHERE pc.prospect_activity_id = pa.id)
    AND NOT EXISTS (
      SELECT 1 FROM prospect_contacts pc 
      WHERE pc.prospect_activity_id = pa.id 
        AND pc.email IS NOT NULL 
        AND TRIM(pc.email) != ''
        AND NOT (
          LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca'
          OR LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$'
        )
    )
  
  UNION ALL
  
  -- new-prospects
  SELECT 'new-prospects', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'new'
  
  UNION ALL
  
  -- needs-enrichment
  SELECT 'needs-enrichment', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'enriching'
  
  UNION ALL
  
  -- ready-outreach
  SELECT 'ready-outreach', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched'
  
  UNION ALL
  
  -- interested
  SELECT 'interested', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('interested', 'proposal')
  
  UNION ALL
  
  -- dashboard (active pipeline)
  SELECT 'dashboard', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'contacted'
  
  UNION ALL
  
  -- closed
  SELECT 'closed', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('closed_won', 'closed_lost')
)
SELECT jsonb_object_agg(view_name, cnt)
FROM view_counts;
$$;