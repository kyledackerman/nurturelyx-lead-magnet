-- Create password reset requests table
CREATE TABLE public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all reset requests"
  ON public.password_reset_requests FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create reset requests for themselves"
  ON public.password_reset_requests FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() AND auth.uid() = requested_by);

CREATE POLICY "Super admins can update reset requests"
  ON public.password_reset_requests FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- Trigger for updated_at
CREATE TRIGGER update_password_reset_requests_updated_at
  BEFORE UPDATE ON public.password_reset_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();