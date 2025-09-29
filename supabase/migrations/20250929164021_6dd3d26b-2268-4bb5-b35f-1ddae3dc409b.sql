-- Add ownership/assignment fields to prospect_activities table
ALTER TABLE public.prospect_activities 
ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN assigned_at timestamp with time zone;

-- Add index for better query performance
CREATE INDEX idx_prospect_activities_assigned_to ON public.prospect_activities(assigned_to);

-- Create function to auto-assign prospect on first interaction
CREATE OR REPLACE FUNCTION public.auto_assign_prospect()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-assign if not already assigned and user is authenticated
  IF NEW.assigned_to IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.assigned_to := auth.uid();
    NEW.assigned_by := auth.uid();
    NEW.assigned_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-assignment on insert
CREATE TRIGGER trigger_auto_assign_prospect
  BEFORE INSERT ON public.prospect_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_prospect();

-- Update RLS policies for ownership-based access
DROP POLICY IF EXISTS "Admins can update prospect activities" ON public.prospect_activities;
DROP POLICY IF EXISTS "Admins can delete prospect activities" ON public.prospect_activities;

-- New ownership-based policies
CREATE POLICY "Assigned admins and super admins can update prospect activities"
ON public.prospect_activities
FOR UPDATE
USING (
  is_super_admin() OR 
  (is_admin() AND assigned_to = auth.uid())
);

CREATE POLICY "Assigned admins and super admins can delete prospect activities"
ON public.prospect_activities
FOR DELETE
USING (
  is_super_admin() OR 
  (is_admin() AND assigned_to = auth.uid())
);

-- Allow super admins to reassign prospects
CREATE POLICY "Super admins can reassign prospects"
ON public.prospect_activities
FOR UPDATE
USING (is_super_admin())
WITH CHECK (is_super_admin());