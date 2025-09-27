-- Update the default priority from 'medium' to 'cold' in prospect_activities table
ALTER TABLE public.prospect_activities 
ALTER COLUMN priority SET DEFAULT 'cold';