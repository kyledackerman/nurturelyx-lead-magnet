-- Phase 1: Clean up currently stuck enrichment jobs
-- Calculate actual progress from enrichment_job_items and update parent jobs

UPDATE enrichment_jobs ej
SET 
  processed_count = (
    SELECT COUNT(*) 
    FROM enrichment_job_items 
    WHERE job_id = ej.id AND status IN ('success', 'failed')
  ),
  success_count = (
    SELECT COUNT(*) 
    FROM enrichment_job_items 
    WHERE job_id = ej.id AND status = 'success'
  ),
  failed_count = (
    SELECT COUNT(*) 
    FROM enrichment_job_items 
    WHERE job_id = ej.id AND status = 'failed'
  ),
  status = CASE 
    WHEN (SELECT COUNT(*) FROM enrichment_job_items WHERE job_id = ej.id AND status = 'pending') = 0
    THEN 'completed'
    ELSE 'running'
  END,
  completed_at = CASE
    WHEN (SELECT COUNT(*) FROM enrichment_job_items WHERE job_id = ej.id AND status = 'pending') = 0
    THEN NOW()
    ELSE completed_at
  END
WHERE status = 'running';

-- Release stale enrichment locks (older than 10 minutes)
UPDATE prospect_activities
SET 
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL,
  status = CASE 
    WHEN status = 'enriching' THEN 'review'
    ELSE status
  END
WHERE enrichment_locked_at < NOW() - INTERVAL '10 minutes';