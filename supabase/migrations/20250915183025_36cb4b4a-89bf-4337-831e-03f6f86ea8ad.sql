-- Create reports table for storing lead reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  report_data JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_views table for analytics
CREATE TABLE public.report_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  ip_address_hash TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_shares table for tracking sharing activity
CREATE TABLE public.report_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'email', 'copy')),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_by_ip_hash TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Public reports are viewable by everyone" 
ON public.reports 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own reports" 
ON public.reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for report_views (insert only for privacy)
CREATE POLICY "Anyone can record report views" 
ON public.report_views 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for report_shares (insert only)
CREATE POLICY "Anyone can record report shares" 
ON public.report_shares 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_reports_domain ON public.reports(domain);
CREATE INDEX idx_reports_slug ON public.reports(slug);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_report_views_report_id ON public.report_views(report_id);
CREATE INDEX idx_report_views_viewed_at ON public.report_views(viewed_at DESC);
CREATE INDEX idx_report_shares_report_id ON public.report_shares(report_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_report_slug(domain_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean domain name and create base slug
  base_slug := regexp_replace(lower(domain_name), '[^a-z0-9]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Add timestamp suffix to make it more unique
  base_slug := base_slug || '-' || extract(epoch from now())::bigint::text;
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.reports WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;