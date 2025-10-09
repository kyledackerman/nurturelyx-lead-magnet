-- Add icebreaker fields to prospect_activities table
ALTER TABLE prospect_activities
ADD COLUMN IF NOT EXISTS icebreaker_text TEXT,
ADD COLUMN IF NOT EXISTS icebreaker_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS icebreaker_edited_manually BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_prospect_activities_icebreaker 
ON prospect_activities(icebreaker_generated_at) 
WHERE icebreaker_text IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN prospect_activities.icebreaker_text IS 'AI-generated personalized outreach opener based on web research';
COMMENT ON COLUMN prospect_activities.icebreaker_generated_at IS 'Timestamp when icebreaker was generated or last regenerated';
COMMENT ON COLUMN prospect_activities.icebreaker_edited_manually IS 'True if the icebreaker was manually edited by a user';