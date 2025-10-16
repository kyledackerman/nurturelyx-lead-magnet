-- Update get_crm_prospects_with_stats to make "missing-emails" filter precise:
-- Only show prospects that tried 3 times (retry_count >= 2) and still have no accepted email
-- (accepted = not legal/privacy/compliance/counsel/attorney/law/dmca)

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
      (p_view = 'needs-enrichment' AND pa.status = 'enriching') OR
      (p_view = 'ready-outreach' AND pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched') OR
      (p_view = 'needs-review' AND pa.status = 'review') OR
      (p_view = 'new-prospects' AND pa.status = 'new') OR
      (p_view = 'interested' AND pa.status IN ('interested', 'proposal')) OR
      (p_view = 'active' AND pa.status IN ('contacted')) OR
      (p_view = 'closed' AND pa.status IN ('closed_won', 'closed_lost')) OR
      (p_view = 'missing-emails' AND 
        pa.status NOT IN ('closed_won', 'closed_lost', 'not_viable', 'enriched') AND 
        pa.enrichment_retry_count >= 2 AND
        EXISTS (
          SELECT 1 FROM prospect_contacts pc 
          WHERE pc.prospect_activity_id = pa.id
        ) AND 
        NOT EXISTS (
          SELECT 1 FROM prospect_contacts pc 
          WHERE pc.prospect_activity_id = pa.id 
            AND pc.email IS NOT NULL 
            AND TRIM(pc.email) != ''
            AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
        )
      ) OR
      (p_view = 'bad-company-names' AND
        pa.status = 'enriched' AND
        (
          r.extracted_company_name IS NULL OR
          r.extracted_company_name LIKE 'Unknown%' OR
          (r.extracted_company_name NOT LIKE '% %' AND 
           LOWER(r.extracted_company_name) = r.extracted_company_name)
        )
      )
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