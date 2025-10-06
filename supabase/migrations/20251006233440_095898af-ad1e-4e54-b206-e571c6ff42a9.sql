-- Create prospect_contacts table to store discovered contact information
CREATE TABLE public.prospect_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_activity_id UUID NOT NULL REFERENCES public.prospect_activities(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('decision_maker', 'generic', 'department')),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  job_title TEXT,
  phone TEXT,
  street_address TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  source TEXT NOT NULL CHECK (source IN ('company_website', 'about_us', 'team_page', 'contact_page', 'linkedin', 'facebook', 'twitter', 'press_release', 'paid_database', 'other')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 1 AND confidence_score <= 100),
  is_decision_maker BOOLEAN NOT NULL DEFAULT false,
  enriched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enriched_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prospect_activity_id, email)
);

-- Create indexes for fast lookups
CREATE INDEX idx_prospect_contacts_prospect_activity ON public.prospect_contacts(prospect_activity_id);
CREATE INDEX idx_prospect_contacts_email ON public.prospect_contacts(email);
CREATE INDEX idx_prospect_contacts_decision_maker ON public.prospect_contacts(is_decision_maker);

-- Add enrichment tracking columns to prospect_activities
ALTER TABLE public.prospect_activities
ADD COLUMN enrichment_status TEXT DEFAULT 'not_started' CHECK (enrichment_status IN ('not_started', 'in_progress', 'completed', 'failed')),
ADD COLUMN enrichment_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN enrichment_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN total_contacts_found INTEGER DEFAULT 0;

-- Enable RLS on prospect_contacts
ALTER TABLE public.prospect_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for prospect_contacts
CREATE POLICY "Admins can view all contacts"
ON public.prospect_contacts
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert contacts"
ON public.prospect_contacts
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update contacts"
ON public.prospect_contacts
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete contacts"
ON public.prospect_contacts
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));