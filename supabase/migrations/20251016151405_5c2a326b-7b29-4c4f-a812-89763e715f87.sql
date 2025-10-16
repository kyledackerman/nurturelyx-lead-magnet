-- Enable real-time updates for prospect_activities table
ALTER TABLE public.prospect_activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospect_activities;

-- Enable real-time updates for prospect_contacts table
ALTER TABLE public.prospect_contacts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospect_contacts;