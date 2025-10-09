-- Add facebook_url column to prospect_contacts table
ALTER TABLE prospect_contacts 
ADD COLUMN facebook_url TEXT;

-- Add facebook_url column to reports table for company-level Facebook page
ALTER TABLE reports 
ADD COLUMN facebook_url TEXT;