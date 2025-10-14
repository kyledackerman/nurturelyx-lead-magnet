-- Create enrichment jobs table for persistent progress tracking
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  total_count int NOT NULL,
  processed_count int DEFAULT 0,
  success_count int DEFAULT 0,
  failed_count int DEFAULT 0,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  job_type text DEFAULT 'manual' CHECK (job_type IN ('manual', 'auto')),
  created_at timestamptz DEFAULT now()
);

-- Create enrichment job items for detailed tracking
CREATE TABLE IF NOT EXISTS enrichment_job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES enrichment_jobs(id) ON DELETE CASCADE,
  prospect_id uuid REFERENCES prospect_activities(id),
  domain text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'rate_limited')),
  contacts_found int,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_created_by ON enrichment_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_created_at ON enrichment_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrichment_job_items_job_id ON enrichment_job_items(job_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_job_items_status ON enrichment_job_items(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_job_items_prospect_id ON enrichment_job_items(prospect_id);

-- Enable RLS
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_job_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrichment_jobs
CREATE POLICY "Admins can view all enrichment jobs"
  ON enrichment_jobs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create enrichment jobs"
  ON enrichment_jobs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "System can update enrichment jobs"
  ON enrichment_jobs FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for enrichment_job_items
CREATE POLICY "Admins can view all enrichment job items"
  ON enrichment_job_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrichment_jobs 
      WHERE enrichment_jobs.id = enrichment_job_items.job_id 
      AND is_admin(auth.uid())
    )
  );

CREATE POLICY "System can insert enrichment job items"
  ON enrichment_job_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrichment_jobs 
      WHERE enrichment_jobs.id = enrichment_job_items.job_id 
      AND is_admin(auth.uid())
    )
  );

CREATE POLICY "System can update enrichment job items"
  ON enrichment_job_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrichment_jobs 
      WHERE enrichment_jobs.id = enrichment_job_items.job_id 
      AND is_admin(auth.uid())
    )
  );

-- Enable realtime for progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE enrichment_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE enrichment_job_items;

-- Schedule auto-enrichment to run every 2 hours
-- First, ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job
SELECT cron.schedule(
  'auto-enrich-prospects-every-2-hours',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:='https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/auto-enrich-prospects',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);