-- Drop old constraint that's missing new statuses
ALTER TABLE public.prospect_activities 
DROP CONSTRAINT IF EXISTS prospect_activities_status_check;

-- Add new constraint with all valid statuses including enriching, enriched, interested
ALTER TABLE public.prospect_activities 
ADD CONSTRAINT prospect_activities_status_check 
CHECK (status IN (
  'new',
  'enriching',
  'enriched',
  'contacted',
  'interested',
  'qualified',
  'proposal',
  'closed_won',
  'closed_lost',
  'not_viable'
));