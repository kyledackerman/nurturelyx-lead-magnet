-- Update prospect_activities table constraints to allow 'not_viable' for status and priority

-- Drop existing constraints
ALTER TABLE public.prospect_activities DROP CONSTRAINT IF EXISTS prospect_activities_status_check;
ALTER TABLE public.prospect_activities DROP CONSTRAINT IF EXISTS prospect_activities_priority_check;

-- Recreate constraints with 'not_viable' option added
ALTER TABLE public.prospect_activities ADD CONSTRAINT prospect_activities_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'closed', 'not_viable'));

ALTER TABLE public.prospect_activities ADD CONSTRAINT prospect_activities_priority_check 
CHECK (priority IN ('hot', 'warm', 'cold', 'not_viable'));