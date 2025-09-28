-- Create audit_logs table for comprehensive change tracking
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  business_context TEXT, -- For storing business-friendly descriptions like "Status changed from new to contacted"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);
CREATE INDEX idx_audit_logs_changed_by ON public.audit_logs(changed_by);

-- Create function to log field changes
CREATE OR REPLACE FUNCTION public.log_field_changes(
  p_table_name TEXT,
  p_record_id UUID,
  p_action_type TEXT,
  p_old_row JSONB DEFAULT NULL,
  p_new_row JSONB DEFAULT NULL,
  p_changed_by UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  field_key TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Handle INSERT operations
  IF p_action_type = 'INSERT' AND p_new_row IS NOT NULL THEN
    FOR field_key IN SELECT jsonb_object_keys(p_new_row)
    LOOP
      IF field_key NOT IN ('created_at', 'updated_at', 'id') THEN
        INSERT INTO public.audit_logs (
          table_name, record_id, action_type, field_name, 
          old_value, new_value, changed_by
        ) VALUES (
          p_table_name, p_record_id, p_action_type, field_key,
          NULL, p_new_row->>field_key, p_changed_by
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Handle UPDATE operations
  IF p_action_type = 'UPDATE' AND p_old_row IS NOT NULL AND p_new_row IS NOT NULL THEN
    FOR field_key IN SELECT jsonb_object_keys(p_new_row)
    LOOP
      old_val := p_old_row->>field_key;
      new_val := p_new_row->>field_key;
      
      -- Only log if value actually changed and it's not a system field
      IF old_val IS DISTINCT FROM new_val AND field_key NOT IN ('created_at', 'updated_at') THEN
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
$$;

-- Create trigger function for prospect_activities
CREATE OR REPLACE FUNCTION public.audit_prospect_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_field_changes('prospect_activities', NEW.id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_field_changes('prospect_activities', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_field_changes('prospect_activities', OLD.id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger function for reports
CREATE OR REPLACE FUNCTION public.audit_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_field_changes('reports', NEW.id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_field_changes('reports', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_field_changes('reports', OLD.id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_prospect_activities_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.prospect_activities
  FOR EACH ROW EXECUTE FUNCTION public.audit_prospect_activities();

CREATE TRIGGER audit_reports_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_reports();

-- Create function to log business context changes
CREATE OR REPLACE FUNCTION public.log_business_context(
  p_table_name TEXT,
  p_record_id UUID,
  p_context TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name, record_id, action_type, business_context,
    ip_address, user_agent, session_id, changed_by
  ) VALUES (
    p_table_name, p_record_id, 'UPDATE', p_context,
    p_ip_address, p_user_agent, p_session_id, auth.uid()
  );
END;
$$;