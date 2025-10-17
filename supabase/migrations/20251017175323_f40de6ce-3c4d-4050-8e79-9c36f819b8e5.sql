-- Phase 1: Immediate cleanup of stuck job and prospects
-- Mark the stuck job as failed
UPDATE enrichment_jobs
SET 
  status = 'failed',
  completed_at = NOW()
WHERE id = '6018ab15-c632-42be-a05b-a76fbb5bce6c'
  AND status = 'running';

-- Reset "enriching but never processed" prospects back to 'new'
-- These are prospects that were selected for enrichment but never actually started
UPDATE prospect_activities
SET 
  status = 'new',
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL,
  updated_at = NOW()
WHERE status = 'enriching'
  AND enrichment_retry_count = 0
  AND enrichment_locked_at IS NULL
  AND contact_count = 0;

-- Phase 3: Add stopped_reason field to track why jobs were stopped
ALTER TABLE enrichment_jobs 
ADD COLUMN IF NOT EXISTS stopped_reason text;

COMMENT ON COLUMN enrichment_jobs.stopped_reason IS 'Reason why the job was stopped (user_requested, system_timeout, etc.)';