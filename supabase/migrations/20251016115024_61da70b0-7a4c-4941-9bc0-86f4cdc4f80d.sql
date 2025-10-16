-- Add has_emails column to enrichment_job_items for better tracking
ALTER TABLE enrichment_job_items 
ADD COLUMN IF NOT EXISTS has_emails BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_enrichment_job_items_has_emails 
ON enrichment_job_items(has_emails);

COMMENT ON COLUMN enrichment_job_items.has_emails IS 'Tracks whether this prospect enrichment found valid email addresses';