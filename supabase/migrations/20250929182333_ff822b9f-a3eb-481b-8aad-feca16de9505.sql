-- Drop the old check constraint
ALTER TABLE public.prospect_activities 
DROP CONSTRAINT IF EXISTS prospect_activities_activity_type_check;

-- Add new check constraint with 'assignment' included
ALTER TABLE public.prospect_activities 
ADD CONSTRAINT prospect_activities_activity_type_check 
CHECK (activity_type = ANY (ARRAY['contacted'::text, 'follow_up'::text, 'note'::text, 'status_change'::text, 'assignment'::text]));