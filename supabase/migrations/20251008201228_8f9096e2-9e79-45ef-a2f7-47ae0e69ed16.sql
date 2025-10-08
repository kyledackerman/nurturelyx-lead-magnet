-- Make last_name nullable in prospect_contacts table
-- This allows storing contacts with only a first name (or company name)
ALTER TABLE prospect_contacts 
ALTER COLUMN last_name DROP NOT NULL;