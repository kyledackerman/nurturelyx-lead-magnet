-- Make all CSV-imported reports public
UPDATE reports 
SET is_public = true 
WHERE lead_source = 'csv_import' 
AND is_public = false;