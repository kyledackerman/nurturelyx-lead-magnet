-- Create import_jobs table for tracking bulk import progress
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  current_batch INTEGER DEFAULT 0,
  total_batches INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  csv_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view their own jobs"
  ON public.import_jobs FOR SELECT
  USING (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can insert jobs"
  ON public.import_jobs FOR INSERT
  WITH CHECK (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update their own jobs"
  ON public.import_jobs FOR UPDATE
  USING (is_admin(auth.uid()) AND created_by = auth.uid());

-- Enable realtime updates
ALTER TABLE public.import_jobs REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.import_jobs;

-- Create index for faster queries
CREATE INDEX idx_import_jobs_created_by ON public.import_jobs(created_by);
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status);