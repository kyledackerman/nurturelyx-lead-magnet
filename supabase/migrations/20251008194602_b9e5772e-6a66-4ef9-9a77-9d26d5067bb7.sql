-- Create prospect imports table for tracking import history
CREATE TABLE public.prospect_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID REFERENCES auth.users(id) NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  successful_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL,
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospect_imports ENABLE ROW LEVEL SECURITY;

-- Admins can view all imports
CREATE POLICY "Admins can view all imports"
ON public.prospect_imports
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can create imports
CREATE POLICY "Admins can create imports"
ON public.prospect_imports
FOR INSERT
WITH CHECK (is_admin(auth.uid()) AND auth.uid() = imported_by);

-- Create index for performance
CREATE INDEX idx_prospect_imports_imported_by ON public.prospect_imports(imported_by);
CREATE INDEX idx_prospect_imports_imported_at ON public.prospect_imports(imported_at DESC);