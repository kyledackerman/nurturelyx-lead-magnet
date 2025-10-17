-- Update get_crm_prospects_with_stats to fix 'missing-emails' and add 'needs-company' view
CREATE OR REPLACE FUNCTION public.get_crm_prospects_with_stats(
  p_status_filter text[] DEFAULT NULL::text[], 
  p_assigned_filter uuid DEFAULT NULL::uuid, 
  p_view text DEFAULT NULL::text, 
  p_lead_source text DEFAULT NULL::text, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, report_id uuid, domain text, slug text, status text, priority text, 
  assigned_to uuid, lost_reason text, lost_notes text, icebreaker_text text, 
  contact_count bigint, company_name text, monthly_revenue numeric, missed_leads integer, 
  traffic_tier text, created_at timestamp with time zone, updated_at timestamp with time zone, 
  lead_source text, enrichment_retry_count integer
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
    pa.updated_at,
    pa.lead_source,
    pa.enrichment_retry_count
  FROM prospect_activities pa
  INNER JOIN reports r ON pa.report_id = r.id
  WHERE 
    (p_status_filter IS NULL OR pa.status = ANY(p_status_filter))
    AND (p_assigned_filter IS NULL OR pa.assigned_to = p_assigned_filter)
    AND (p_lead_source IS NULL OR pa.lead_source = p_lead_source)
    AND (
      p_view IS NULL OR
      (p_view = 'warm-inbound' AND pa.lead_source = 'warm_inbound') OR
      (p_view = 'needs-enrichment' AND pa.status = 'enriching' AND pa.contact_count = 0 AND pa.enrichment_retry_count < 3) OR
      (p_view = 'ready-outreach' AND pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched') OR
      (p_view = 'needs-review' AND pa.status = 'review') OR
      (p_view = 'new-prospects' AND pa.status = 'new') OR
      (p_view = 'interested' AND pa.status IN ('interested', 'proposal')) OR
      (p_view = 'active' AND pa.status IN ('contacted')) OR
      (p_view = 'closed' AND pa.status IN ('closed_won', 'closed_lost')) OR
      (p_view = 'missing-emails' AND pa.status = 'enriching' AND pa.enrichment_retry_count >= 1 AND NOT EXISTS (
        SELECT 1 FROM prospect_contacts pc
        WHERE pc.prospect_activity_id = pa.id
          AND pc.email IS NOT NULL AND TRIM(pc.email) <> ''
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
      )) OR
      (p_view = 'needs-company' AND pa.icebreaker_text IS NOT NULL AND r.extracted_company_name IS NULL 
       AND pa.status NOT IN ('enriched','closed_won','closed_lost','not_viable')
       AND EXISTS (
        SELECT 1 FROM prospect_contacts pc
        WHERE pc.prospect_activity_id = pa.id
          AND pc.email IS NOT NULL AND TRIM(pc.email) <> ''
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
      ))
    )
  ORDER BY 
    CASE pa.lead_source 
      WHEN 'warm_inbound' THEN 1 
      ELSE 2 
    END,
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

-- Update get_crm_sidebar_counts to match the new filters
CREATE OR REPLACE FUNCTION public.get_crm_sidebar_counts()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH view_counts AS (
  SELECT 'warm-inbound'::text as view_name, COUNT(DISTINCT r.domain)::int as cnt
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.lead_source = 'warm_inbound'
  
  UNION ALL
  
  SELECT 'needs-review', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'review'
  
  UNION ALL
  
  SELECT 'missing-emails', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'enriching'
    AND pa.enrichment_retry_count >= 1
    AND NOT EXISTS (
      SELECT 1 FROM prospect_contacts pc
      WHERE pc.prospect_activity_id = pa.id
        AND pc.email IS NOT NULL AND TRIM(pc.email) <> ''
        AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
        AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
    )
  
  UNION ALL
  
  SELECT 'needs-company', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.icebreaker_text IS NOT NULL
    AND r.extracted_company_name IS NULL
    AND pa.status NOT IN ('enriched','closed_won','closed_lost','not_viable')
    AND EXISTS (
      SELECT 1 FROM prospect_contacts pc
      WHERE pc.prospect_activity_id = pa.id
        AND pc.email IS NOT NULL AND TRIM(pc.email) <> ''
        AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
        AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
    )
  
  UNION ALL
  
  SELECT 'new-prospects', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'new'
  
  UNION ALL
  
  SELECT 'needs-enrichment', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'enriching'
    AND pa.contact_count = 0
    AND pa.enrichment_retry_count < 3
  
  UNION ALL
  
  SELECT 'ready-outreach', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched'
  
  UNION ALL
  
  SELECT 'interested', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('interested', 'proposal')
  
  UNION ALL
  
  SELECT 'dashboard', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status = 'contacted'
  
  UNION ALL
  
  SELECT 'closed', COUNT(DISTINCT r.domain)::int
  FROM prospect_activities pa
  JOIN reports r ON pa.report_id = r.id
  WHERE pa.status IN ('closed_won', 'closed_lost')
)
SELECT jsonb_object_agg(view_name, cnt)
FROM view_counts;
$function$;

-- Add trigger to auto-promote when company name is added
CREATE OR REPLACE FUNCTION public.auto_promote_on_company_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_has_valid_email boolean;
  v_has_icebreaker boolean;
  v_prospect_id uuid;
  v_current_status text;
BEGIN
  -- Only act when company name is added (was NULL, now NOT NULL)
  IF OLD.extracted_company_name IS NULL AND NEW.extracted_company_name IS NOT NULL THEN
    
    -- Find the prospect activity for this report
    SELECT pa.id, pa.status,
           pa.icebreaker_text IS NOT NULL,
           EXISTS (
             SELECT 1 FROM prospect_contacts pc
             WHERE pc.prospect_activity_id = pa.id
               AND pc.email IS NOT NULL AND TRIM(pc.email) <> ''
               AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
               AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
           )
    INTO v_prospect_id, v_current_status, v_has_icebreaker, v_has_valid_email
    FROM prospect_activities pa
    WHERE pa.report_id = NEW.id
    LIMIT 1;
    
    -- If has valid email + icebreaker + not already closed, promote to enriched
    IF v_prospect_id IS NOT NULL 
       AND v_has_valid_email 
       AND v_has_icebreaker 
       AND v_current_status NOT IN ('enriched', 'closed_won', 'closed_lost', 'not_viable') THEN
      
      UPDATE prospect_activities
      SET 
        status = 'enriched',
        enrichment_locked_at = NULL,
        enrichment_locked_by = NULL,
        updated_at = NOW()
      WHERE id = v_prospect_id;
      
      -- Log to audit trail
      INSERT INTO audit_logs (
        table_name, record_id, action_type, field_name,
        old_value, new_value, business_context
      ) VALUES (
        'prospect_activities', v_prospect_id, 'UPDATE', 'status',
        v_current_status, 'enriched',
        'Auto-promoted to enriched: company name added (all 3 criteria met for ' || NEW.domain || ')'
      );
      
      RAISE NOTICE 'Auto-promoted % to enriched (company name added)', NEW.domain;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on reports table
DROP TRIGGER IF EXISTS trigger_auto_promote_on_company_name ON reports;
CREATE TRIGGER trigger_auto_promote_on_company_name
  AFTER UPDATE OF extracted_company_name ON reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_promote_on_company_name();