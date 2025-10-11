-- Add lead_source to prospect_activities
ALTER TABLE prospect_activities 
  ADD COLUMN lead_source text 
  DEFAULT 'cold_outbound'
  CHECK (lead_source IN ('cold_outbound', 'warm_inbound', 'import', 'referral'));

CREATE INDEX idx_prospect_activities_lead_source ON prospect_activities(lead_source);

-- Add lead_source to reports
ALTER TABLE reports 
  ADD COLUMN lead_source text 
  DEFAULT 'admin_generated'
  CHECK (lead_source IN ('self_service', 'admin_generated', 'csv_import'));

CREATE INDEX idx_reports_lead_source ON reports(lead_source);

-- Backfill existing data
-- Mark CSV imports in reports table
UPDATE reports 
SET lead_source = 'csv_import' 
WHERE import_source = 'csv_bulk_import';

-- Mark truly anonymous self-service reports
UPDATE reports 
SET lead_source = 'self_service' 
WHERE user_id IS NULL AND import_source IS NULL;

-- Mark admin-generated reports
UPDATE reports 
SET lead_source = 'admin_generated' 
WHERE user_id IS NOT NULL AND import_source IS NULL;

-- Update prospect_activities to match
UPDATE prospect_activities pa
SET lead_source = CASE 
  WHEN r.user_id IS NULL AND r.import_source IS NULL THEN 'warm_inbound'
  WHEN r.import_source = 'csv_bulk_import' THEN 'import'
  ELSE 'cold_outbound'
END
FROM reports r
WHERE pa.report_id = r.id;

-- Update get_crm_prospects_with_stats function to include lead_source
CREATE OR REPLACE FUNCTION public.get_crm_prospects_with_stats(
  p_status_filter text[] DEFAULT NULL,
  p_assigned_filter uuid DEFAULT NULL,
  p_view text DEFAULT NULL,
  p_lead_source text DEFAULT NULL,
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
  lead_source text
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
    pa.lead_source
  FROM prospect_activities pa
  INNER JOIN reports r ON pa.report_id = r.id
  WHERE 
    (p_status_filter IS NULL OR pa.status = ANY(p_status_filter))
    AND (p_assigned_filter IS NULL OR pa.assigned_to = p_assigned_filter)
    AND (p_lead_source IS NULL OR pa.lead_source = p_lead_source)
    AND (
      p_view IS NULL OR
      (p_view = 'warm-inbound' AND pa.lead_source = 'warm_inbound') OR
      (p_view = 'needs-enrichment' AND pa.contact_count = 0 AND pa.status IN ('enriching', 'review')) OR
      (p_view = 'ready-outreach' AND pa.contact_count > 0 AND pa.icebreaker_text IS NOT NULL AND pa.status = 'enriched') OR
      (p_view = 'needs-review' AND pa.status = 'review') OR
      (p_view = 'new-prospects' AND pa.status = 'new') OR
      (p_view = 'active' AND pa.status IN ('contacted', 'proposal')) OR
      (p_view = 'closed' AND pa.status IN ('closed_won', 'closed_lost'))
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

-- Update get_crm_metrics function to include warm inbound tracking
CREATE OR REPLACE FUNCTION public.get_crm_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'totalProspects', (SELECT COUNT(*) FROM prospect_activities WHERE status NOT IN ('closed_lost', 'not_viable')),
    'pipelineValue', (SELECT COALESCE(SUM((r.report_data->>'monthlyRevenueLost')::numeric), 0) 
                      FROM prospect_activities pa 
                      JOIN reports r ON pa.report_id = r.id 
                      WHERE pa.status IN ('contacted', 'proposal')),
    'hotLeads', (SELECT COUNT(*) FROM prospect_activities WHERE priority = 'hot'),
    'overdueTasks', (SELECT COUNT(*) FROM prospect_tasks WHERE status = 'pending' AND due_date < NOW()),
    'dueTodayTasks', (SELECT COUNT(*) FROM prospect_tasks WHERE status = 'pending' AND DATE(due_date) = CURRENT_DATE),
    'statusBreakdown', (SELECT jsonb_object_agg(status, count) FROM (
      SELECT status, COUNT(*) as count FROM prospect_activities GROUP BY status
    ) s),
    'warmInboundCount', (SELECT COUNT(*) FROM prospect_activities WHERE lead_source = 'warm_inbound'),
    'warmInboundConversion', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE lead_source = 'warm_inbound') > 0 
        THEN ROUND((COUNT(*) FILTER (WHERE lead_source = 'warm_inbound' AND status = 'closed_won')::numeric / 
                    COUNT(*) FILTER (WHERE lead_source = 'warm_inbound')::numeric) * 100, 1)
        ELSE 0 
      END
      FROM prospect_activities
    ),
    'coldOutboundConversion', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE lead_source IN ('cold_outbound', 'import')) > 0 
        THEN ROUND((COUNT(*) FILTER (WHERE lead_source IN ('cold_outbound', 'import') AND status = 'closed_won')::numeric / 
                    COUNT(*) FILTER (WHERE lead_source IN ('cold_outbound', 'import'))::numeric) * 100, 1)
        ELSE 0 
      END
      FROM prospect_activities
    )
  );
$function$;