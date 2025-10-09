-- Update status from 'review' to 'enriched' for bakerswaterproofing.com and jeswork.com
UPDATE prospect_activities
SET status = 'enriched', updated_at = now()
WHERE report_id IN (
  SELECT id FROM reports 
  WHERE domain IN ('bakerswaterproofing.com', 'jeswork.com')
)
AND status = 'review';