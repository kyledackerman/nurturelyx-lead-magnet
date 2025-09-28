-- Fix status check constraint to include closed_won and closed_lost
ALTER TABLE public.prospect_activities DROP CONSTRAINT IF EXISTS prospect_activities_status_check;

ALTER TABLE public.prospect_activities ADD CONSTRAINT prospect_activities_status_check 
CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost', 'not_viable'));
