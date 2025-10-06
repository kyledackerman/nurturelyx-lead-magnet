-- Add lost reason tracking fields to prospect_activities table
ALTER TABLE public.prospect_activities 
ADD COLUMN lost_reason text,
ADD COLUMN lost_notes text,
ADD COLUMN closed_at timestamp with time zone;

-- Add index for better query performance on lost reasons
CREATE INDEX idx_prospect_activities_lost_reason ON public.prospect_activities(lost_reason) WHERE lost_reason IS NOT NULL;

-- Add index for closed prospects
CREATE INDEX idx_prospect_activities_closed_at ON public.prospect_activities(closed_at) WHERE closed_at IS NOT NULL;