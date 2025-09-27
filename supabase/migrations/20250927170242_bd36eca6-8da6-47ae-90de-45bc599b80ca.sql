-- Create prospect_activities table for CRM tracking
CREATE TABLE public.prospect_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('contacted', 'follow_up', 'note', 'status_change')),
  notes TEXT,
  contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'linkedin', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('hot', 'warm', 'cold')),
  next_follow_up TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prospect_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for prospect activities
CREATE POLICY "Admins can view all prospect activities" 
ON public.prospect_activities 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert prospect activities" 
ON public.prospect_activities 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update prospect activities" 
ON public.prospect_activities 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete prospect activities" 
ON public.prospect_activities 
FOR DELETE 
USING (is_admin());

-- Add foreign key reference to reports
ALTER TABLE public.prospect_activities 
ADD CONSTRAINT fk_prospect_activities_report 
FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prospect_activities_updated_at
BEFORE UPDATE ON public.prospect_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_prospect_activities_report_id ON public.prospect_activities(report_id);
CREATE INDEX idx_prospect_activities_status ON public.prospect_activities(status);
CREATE INDEX idx_prospect_activities_priority ON public.prospect_activities(priority);