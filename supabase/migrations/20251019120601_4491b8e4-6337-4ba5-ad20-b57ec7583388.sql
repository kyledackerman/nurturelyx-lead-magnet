-- Add personalized use cases columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS personalized_use_cases TEXT,
ADD COLUMN IF NOT EXISTS use_cases_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_cases_generated_at TIMESTAMPTZ;

-- Add index for faster queries on approved use cases
CREATE INDEX IF NOT EXISTS idx_reports_use_cases_approved ON reports(use_cases_approved) WHERE personalized_use_cases IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN reports.personalized_use_cases IS 'AI-generated industry-specific scenarios showing how this company can use identity resolution. Auto-approved and editable by admins.';