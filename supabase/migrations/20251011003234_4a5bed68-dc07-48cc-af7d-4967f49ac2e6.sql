-- Phase 1 Emergency Fix: Reduce audit logging to only critical fields
-- This reduces log growth from 2,684/day to ~800/day (70% reduction)

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
  -- Reduced from 9 fields to 4 most critical sales fields
  critical_fields TEXT[] := ARRAY['status', 'assigned_to', 'closed_at', 'lost_reason'];
BEGIN
  -- Skip INSERT logging for prospect_activities (creates too much noise)
  -- Only log UPDATEs and DELETEs
  
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
  
  -- Only log DELETE operations
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

-- Delete audit logs older than 30 days (one-time cleanup)
-- This will reduce from 9,506 logs to ~2,500 logs (73% reduction)
DELETE FROM audit_logs WHERE changed_at < NOW() - INTERVAL '30 days';

-- Create function for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE changed_at < NOW() - INTERVAL '30 days';
  RAISE NOTICE 'Cleaned up audit logs older than 30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';