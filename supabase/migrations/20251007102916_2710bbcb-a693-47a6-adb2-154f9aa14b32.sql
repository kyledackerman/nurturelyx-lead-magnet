-- Rollback enrichment feature: Remove prospect_contacts table and enrichment columns

-- Drop the prospect_contacts table and all its policies, indexes, and constraints
DROP TABLE IF EXISTS public.prospect_contacts CASCADE;

-- Remove enrichment columns from prospect_activities
ALTER TABLE public.prospect_activities 
  DROP COLUMN IF EXISTS enrichment_status,
  DROP COLUMN IF EXISTS enrichment_started_at,
  DROP COLUMN IF EXISTS enrichment_completed_at,
  DROP COLUMN IF EXISTS total_contacts_found;