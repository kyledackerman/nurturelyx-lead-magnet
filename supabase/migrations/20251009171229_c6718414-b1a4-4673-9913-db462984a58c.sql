-- Fix prospects that were incorrectly marked as 'review' when they have both contacts and icebreakers
UPDATE prospect_activities
SET status = 'enriched'
WHERE status = 'review'
  AND id IN (
    SELECT pa.id 
    FROM prospect_activities pa
    WHERE pa.status = 'review'
      AND pa.icebreaker_text IS NOT NULL 
      AND pa.icebreaker_text != ''
      AND EXISTS (
        SELECT 1 FROM prospect_contacts pc 
        WHERE pc.prospect_activity_id = pa.id
      )
  );