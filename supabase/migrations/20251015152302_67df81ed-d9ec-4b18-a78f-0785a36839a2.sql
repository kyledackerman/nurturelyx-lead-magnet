-- Phase 0: Fix check constraint to allow 'failed' status
ALTER TABLE enrichment_jobs DROP CONSTRAINT IF EXISTS enrichment_jobs_status_check;
ALTER TABLE enrichment_jobs ADD CONSTRAINT enrichment_jobs_status_check 
  CHECK (status IN ('queued', 'running', 'completed', 'failed'));

-- Phase 1: Disable Auto-Enrichment
-- 1.1 Disable the cron job (will fail silently if doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('auto-enrich-prospects-every-2-hours');
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN OTHERS THEN NULL;
END $$;

-- 1.2 Disable auto-enrichment toggle
UPDATE enrichment_settings
SET 
  auto_enrichment_enabled = false,
  updated_at = NOW()
WHERE auto_enrichment_enabled = true;

-- Phase 2: Clean Up Stuck Prospects
-- 2.1 Move prospects stuck in "enriching" for 24+ hours back to "new"
UPDATE prospect_activities
SET 
  status = 'new',
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL,
  enrichment_retry_count = 0,
  updated_at = NOW()
WHERE status = 'enriching'
  AND (enrichment_locked_at IS NULL OR enrichment_locked_at < NOW() - INTERVAL '24 hours');

-- 2.2 Archive unviable "review" prospects with 0 contacts
UPDATE prospect_activities
SET 
  status = 'not_viable',
  lost_reason = 'enrichment_failed',
  lost_notes = 'Auto-archived: No contacts found after multiple enrichment attempts',
  updated_at = NOW()
WHERE status = 'review'
  AND contact_count = 0
  AND enrichment_retry_count >= 2
  AND updated_at < NOW() - INTERVAL '7 days';

-- 2.3 Give second chance to recent "review" failures
UPDATE prospect_activities
SET 
  status = 'new',
  enrichment_retry_count = 0,
  updated_at = NOW()
WHERE status = 'review'
  AND contact_count = 0
  AND enrichment_retry_count < 2
  AND updated_at >= NOW() - INTERVAL '7 days';

-- Phase 3: Reset Counters & Clean Data
-- 3.1 Reset failed counters
UPDATE enrichment_settings
SET 
  total_failed = 0,
  updated_at = NOW();

-- 3.2 Mark stuck running jobs as failed
UPDATE enrichment_jobs
SET 
  status = 'failed',
  completed_at = NOW()
WHERE status = 'running'
  AND started_at < NOW() - INTERVAL '2 hours';

-- Phase 5: Optional Database Cleanup
-- 5.1 Remove auto_enrichment_enabled column (keep facebook_scraping_enabled)
ALTER TABLE enrichment_settings
DROP COLUMN IF EXISTS auto_enrichment_enabled;