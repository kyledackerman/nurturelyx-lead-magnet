-- Add composite index for CRM prospects query performance
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status_priority 
ON prospect_activities(status, priority, updated_at DESC);

-- Add index for lead source filtering
CREATE INDEX IF NOT EXISTS idx_prospect_activities_lead_source
ON prospect_activities(lead_source, updated_at DESC);