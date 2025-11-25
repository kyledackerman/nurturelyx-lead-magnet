-- =============================================
-- PHASE 1: Blog CMS Database Schema
-- =============================================

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_authors table (migrate from authors.ts)
CREATE TABLE IF NOT EXISTS public.blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  job_title TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[],
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  read_time TEXT,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  keywords TEXT[],
  
  -- Related content
  related_reports TEXT[],
  related_articles UUID[],
  key_takeaways TEXT[],
  
  -- Series support
  series_name TEXT,
  series_url TEXT,
  series_order INTEGER,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Create seo_page_settings table for non-blog pages
CREATE TABLE IF NOT EXISTS public.seo_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  keywords TEXT[],
  robots_meta TEXT DEFAULT 'index,follow',
  structured_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_page_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Public can view categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for blog_authors
CREATE POLICY "Public can view authors"
  ON public.blog_authors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage authors"
  ON public.blog_authors FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for blog_posts
CREATE POLICY "Public can view published posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all posts"
  ON public.blog_posts FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for seo_page_settings
CREATE POLICY "Public can view SEO settings"
  ON public.seo_page_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage SEO settings"
  ON public.seo_page_settings FOR ALL
  USING (is_admin(auth.uid()));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_authors_updated_at
  BEFORE UPDATE ON public.blog_authors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_page_settings_updated_at
  BEFORE UPDATE ON public.seo_page_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Lead Generation', 'lead-generation', 'Strategies and techniques for generating qualified B2B leads'),
  ('Visitor Identification', 'visitor-identification', 'Technology and methods for identifying anonymous website visitors'),
  ('B2B Marketing', 'b2b-marketing', 'Marketing strategies specifically for B2B businesses'),
  ('Industry Insights', 'industry-insights', 'Industry-specific insights and best practices'),
  ('Ambassador Program', 'ambassador-program', 'Information about the NurturelyX Ambassador Program')
ON CONFLICT (slug) DO NOTHING;

-- Insert authors from authors.ts
INSERT INTO public.blog_authors (name, email, job_title, bio, expertise, linkedin_url) VALUES
  ('NurturelyX Team', NULL, 'Lead Generation Experts', 
   'The NurturelyX team consists of marketing technologists, data scientists, and B2B lead generation specialists with over 50 years of combined experience helping businesses identify and convert anonymous website visitors into qualified leads.',
   ARRAY['Identity Resolution', 'Lead Generation', 'B2B Marketing', 'Conversion Optimization', 'Marketing Analytics'],
   'https://www.linkedin.com/company/nurturely'),
  ('Sarah Johnson', 'sarah@nurturely.io', 'Senior Marketing Strategist',
   'Sarah specializes in identity resolution technology and has helped over 200 businesses improve their lead generation ROI. With 12 years in B2B marketing, she''s an expert in turning anonymous traffic into qualified pipeline.',
   ARRAY['Marketing Strategy', 'Lead Generation', 'Analytics', 'Customer Acquisition'],
   'https://www.linkedin.com/in/sarahjohnson-marketing')
ON CONFLICT DO NOTHING;