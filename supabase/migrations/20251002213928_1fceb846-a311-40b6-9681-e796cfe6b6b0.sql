-- Allow admins to view report views for analytics
CREATE POLICY "Admins can view all report views"
ON public.report_views
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));