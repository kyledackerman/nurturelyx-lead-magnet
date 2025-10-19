-- Create use_case_generation_jobs table for tracking backfill progress
CREATE TABLE use_case_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'running', -- running, paused, completed, failed
  total_count INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_processed_report_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE use_case_generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view jobs" ON use_case_generation_jobs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create jobs" ON use_case_generation_jobs
  FOR INSERT WITH CHECK (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update jobs" ON use_case_generation_jobs
  FOR UPDATE USING (is_admin(auth.uid()));