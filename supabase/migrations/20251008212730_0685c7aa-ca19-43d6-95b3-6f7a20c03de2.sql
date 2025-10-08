-- Create enrichment_settings table
CREATE TABLE IF NOT EXISTS public.enrichment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_enrichment_enabled boolean NOT NULL DEFAULT false,
  last_run_at timestamp with time zone,
  total_enriched integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrichment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view enrichment settings"
ON public.enrichment_settings
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only admins can update settings
CREATE POLICY "Admins can update enrichment settings"
ON public.enrichment_settings
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Only admins can insert settings
CREATE POLICY "Admins can insert enrichment settings"
ON public.enrichment_settings
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Insert initial settings row
INSERT INTO public.enrichment_settings (auto_enrichment_enabled) 
VALUES (false)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_enrichment_settings_updated_at
BEFORE UPDATE ON public.enrichment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();