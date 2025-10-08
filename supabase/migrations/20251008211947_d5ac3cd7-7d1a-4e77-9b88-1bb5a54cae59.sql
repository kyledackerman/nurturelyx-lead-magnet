-- Add enrichment tracking columns to prospect_activities
ALTER TABLE prospect_activities 
ADD COLUMN IF NOT EXISTS enrichment_retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_enrichment_attempt timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_enriched boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enrichment_source text;

-- Add review status to the status check constraint
-- First drop the existing constraint
ALTER TABLE prospect_activities DROP CONSTRAINT IF EXISTS prospect_activities_status_check;

-- Add the new constraint with review status
ALTER TABLE prospect_activities 
ADD CONSTRAINT prospect_activities_status_check 
CHECK (status IN ('new', 'enriching', 'enriched', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'review'));

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create index for efficient querying of prospects needing enrichment
CREATE INDEX IF NOT EXISTS idx_prospect_activities_enrichment 
ON prospect_activities(status, enrichment_retry_count, last_enrichment_attempt) 
WHERE status IN ('new', 'enriching', 'review');