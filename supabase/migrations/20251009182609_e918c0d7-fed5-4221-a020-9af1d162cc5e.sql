-- Add import_source column to reports table
ALTER TABLE reports ADD COLUMN import_source text DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX idx_reports_import_source ON reports(import_source) WHERE import_source IS NOT NULL;

-- Update existing CSV-imported reports (user_id IS NULL means admin import)
UPDATE reports 
SET import_source = 'csv_bulk_import'
WHERE user_id IS NULL 
AND created_at >= '2025-10-01'::date;

-- Add comment for clarity
COMMENT ON COLUMN reports.import_source IS 'Source of the report: csv_bulk_import for admin imports, NULL for user-generated reports';