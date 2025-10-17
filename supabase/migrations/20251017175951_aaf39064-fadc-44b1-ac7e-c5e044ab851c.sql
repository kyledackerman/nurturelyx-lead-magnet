
-- Phase 1: Reset stuck prospects that were marked enriching but never processed
UPDATE prospect_activities
SET 
  status = 'new',
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL,
  updated_at = NOW()
WHERE status = 'enriching'
  AND enrichment_locked_at IS NULL
  AND enrichment_retry_count = 0
  AND contact_count = 0;

-- Log how many were reset
DO $$
DECLARE
  reset_count INTEGER;
BEGIN
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RAISE NOTICE 'Reset % prospects from enriching to new status', reset_count;
END $$;
