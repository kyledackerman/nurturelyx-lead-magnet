-- Backfill CSV imports with Kyle as owner
-- Only update reports that have prospect_activities created by an admin (indicating CSV import)
UPDATE reports r
SET 
  import_source = 'csv_bulk_import',
  user_id = '850078c3-247c-4904-9b9a-ebec624d4ef5',
  updated_at = now()
FROM prospect_activities pa
WHERE r.id = pa.report_id
  AND r.import_source IS NULL
  AND r.user_id IS NULL
  AND pa.created_by IS NOT NULL;

-- Assign existing prospect_activities for CSV imports to Kyle
UPDATE prospect_activities
SET 
  assigned_to = '850078c3-247c-4904-9b9a-ebec624d4ef5',
  assigned_by = '850078c3-247c-4904-9b9a-ebec624d4ef5',
  assigned_at = COALESCE(assigned_at, now())
WHERE report_id IN (
  SELECT id 
  FROM reports
  WHERE import_source = 'csv_bulk_import'
)
AND assigned_to IS NULL;