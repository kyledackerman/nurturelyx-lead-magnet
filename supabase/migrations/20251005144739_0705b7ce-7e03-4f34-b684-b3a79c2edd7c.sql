-- Create prospect_tasks table for CRM task management
CREATE TABLE IF NOT EXISTS public.prospect_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  prospect_activity_id UUID REFERENCES public.prospect_activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_prospect_tasks_due_date ON public.prospect_tasks(due_date);
CREATE INDEX idx_prospect_tasks_status ON public.prospect_tasks(status);
CREATE INDEX idx_prospect_tasks_assigned_to ON public.prospect_tasks(assigned_to);
CREATE INDEX idx_prospect_tasks_report_id ON public.prospect_tasks(report_id);

-- Enable RLS
ALTER TABLE public.prospect_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prospect_tasks
CREATE POLICY "Admins can view all tasks"
  ON public.prospect_tasks FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create tasks"
  ON public.prospect_tasks FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tasks"
  ON public.prospect_tasks FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tasks"
  ON public.prospect_tasks FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_prospect_tasks_updated_at
  BEFORE UPDATE ON public.prospect_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();