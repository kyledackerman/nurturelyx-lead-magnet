-- One-time cleanup: Mark all stuck enrichment jobs as failed and release locks
-- This fixes the 5+ jobs currently stuck in "running" status

-- Mark stuck jobs as failed (running for > 10 minutes)
UPDATE enrichment_jobs 
SET 
  status = 'failed',
  completed_at = NOW(),
  processed_count = total_count
WHERE status = 'running' 
  AND started_at < NOW() - INTERVAL '10 minutes';

-- Release all prospect locks (stuck for > 10 minutes)
UPDATE prospect_activities
SET 
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL
WHERE enrichment_locked_at < NOW() - INTERVAL '10 minutes';