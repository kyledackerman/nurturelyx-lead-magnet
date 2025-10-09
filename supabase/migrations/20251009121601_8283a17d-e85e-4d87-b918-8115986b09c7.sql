-- Phase 1: Create function to get domain contact counts (fixes N+1 query problem)
CREATE OR REPLACE FUNCTION public.get_domain_contact_counts()
RETURNS TABLE (
  domain text,
  contact_count bigint
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    r.domain,
    COUNT(DISTINCT pc.id) as contact_count
  FROM reports r
  LEFT JOIN prospect_contacts pc ON r.id = pc.report_id
  GROUP BY r.domain;
$$;

-- Phase 3: Create unified CRM metrics function
CREATE OR REPLACE FUNCTION public.get_crm_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    ) s)
  );
$$;

-- Phase 3: Reduce audit log overhead - modify log_field_changes to be selective
CREATE OR REPLACE FUNCTION public.log_field_changes(
  p_table_name text, 
  p_record_id uuid, 
  p_action_type text, 
  p_old_row jsonb DEFAULT NULL::jsonb, 
  p_new_row jsonb DEFAULT NULL::jsonb, 
  p_changed_by uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  field_key TEXT;
  old_val TEXT;
  new_val TEXT;
  critical_fields TEXT[] := ARRAY['status', 'priority', 'assigned_to', 'lost_reason', 'closed_at', 'email', 'phone', 'first_name', 'last_name'];
BEGIN
  -- Handle INSERT operations (only log creation event, not all fields)
  IF p_action_type = 'INSERT' AND p_new_row IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action_type, field_name, 
      old_value, new_value, changed_by
    ) VALUES (
      p_table_name, p_record_id, p_action_type, 'record_created',
      NULL, 'created', p_changed_by
    );
  END IF;
  
  -- Handle UPDATE operations (only log critical field changes)
  IF p_action_type = 'UPDATE' AND p_old_row IS NOT NULL AND p_new_row IS NOT NULL THEN
    FOR field_key IN SELECT jsonb_object_keys(p_new_row)
    LOOP
      old_val := p_old_row->>field_key;
      new_val := p_new_row->>field_key;
      
      -- Only log if value changed AND it's a critical field
      IF old_val IS DISTINCT FROM new_val 
         AND field_key = ANY(critical_fields) THEN
        INSERT INTO public.audit_logs (
          table_name, record_id, action_type, field_name,
          old_value, new_value, changed_by
        ) VALUES (
          p_table_name, p_record_id, p_action_type, field_key,
          old_val, new_val, p_changed_by
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Handle DELETE operations
  IF p_action_type = 'DELETE' AND p_old_row IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      table_name, record_id, action_type, field_name,
      old_value, new_value, changed_by
    ) VALUES (
      p_table_name, p_record_id, p_action_type, 'record_deleted',
      'existed', 'deleted', p_changed_by
    );
  END IF;
END;
$function$;

-- Phase 4: Add database indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status ON prospect_activities(status);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_priority ON prospect_activities(priority);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_assigned_to ON prospect_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status_priority ON prospect_activities(status, priority);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_report_id ON prospect_activities(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_contacts_report_id ON prospect_contacts(report_id);
CREATE INDEX IF NOT EXISTS idx_prospect_tasks_status_due_date ON prospect_tasks(status, due_date);
CREATE INDEX IF NOT EXISTS idx_reports_domain ON reports(domain);
CREATE INDEX IF NOT EXISTS idx_reports_is_public ON reports(is_public);