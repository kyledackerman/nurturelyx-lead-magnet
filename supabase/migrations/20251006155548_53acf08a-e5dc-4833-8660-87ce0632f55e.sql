-- Create prospect_exports table for audit tracking
CREATE TABLE public.prospect_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exported_by UUID NOT NULL REFERENCES auth.users(id),
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prospect_ids UUID[] NOT NULL,
  domains TEXT[] NOT NULL,
  export_count INTEGER NOT NULL,
  filters_applied JSONB,
  auto_updated_to_contacted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospect_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all exports"
ON public.prospect_exports
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create exports"
ON public.prospect_exports
FOR INSERT
WITH CHECK (is_admin(auth.uid()) AND auth.uid() = exported_by);

-- Add index for performance
CREATE INDEX idx_prospect_exports_exported_by ON public.prospect_exports(exported_by);
CREATE INDEX idx_prospect_exports_exported_at ON public.prospect_exports(exported_at DESC);