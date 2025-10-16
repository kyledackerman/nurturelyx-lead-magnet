-- Clean up any existing duplicate contacts (keep the newest one)
DELETE FROM prospect_contacts a
USING prospect_contacts b
WHERE a.id < b.id 
  AND a.prospect_activity_id = b.prospect_activity_id 
  AND a.email = b.email
  AND a.email IS NOT NULL;

-- Add unique constraint to prevent duplicate emails per prospect
ALTER TABLE prospect_contacts 
ADD CONSTRAINT prospect_contacts_activity_email_unique 
UNIQUE (prospect_activity_id, email);