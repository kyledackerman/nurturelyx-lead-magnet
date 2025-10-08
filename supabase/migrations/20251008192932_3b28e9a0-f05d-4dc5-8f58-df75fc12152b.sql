-- Add 'enriching' status to prospect_activities
-- Note: We're using a comment to document the new status value
COMMENT ON COLUMN prospect_activities.status IS 'Valid values: new, enriching, contacted, proposal, closed_won, closed_lost';

-- Create prospect_contacts table
CREATE TABLE public.prospect_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_activity_id UUID NOT NULL REFERENCES public.prospect_activities(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  linkedin_url TEXT,
  notes TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_prospect_contacts_activity ON public.prospect_contacts(prospect_activity_id);
CREATE INDEX idx_prospect_contacts_report ON public.prospect_contacts(report_id);
CREATE INDEX idx_prospect_contacts_primary ON public.prospect_contacts(is_primary) WHERE is_primary = true;

-- Enable Row Level Security
ALTER TABLE public.prospect_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prospect_contacts
CREATE POLICY "Admins can view all contacts"
  ON public.prospect_contacts
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert contacts"
  ON public.prospect_contacts
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update contacts"
  ON public.prospect_contacts
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete contacts"
  ON public.prospect_contacts
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_prospect_contacts_updated_at
  BEFORE UPDATE ON public.prospect_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit trigger for prospect_contacts
CREATE OR REPLACE FUNCTION public.audit_prospect_contacts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_field_changes('prospect_contacts', NEW.id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_field_changes('prospect_contacts', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_field_changes('prospect_contacts', OLD.id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_prospect_contacts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.prospect_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_prospect_contacts();