-- Add columns to support tracking all page types
ALTER TABLE public.report_views 
  ADD COLUMN IF NOT EXISTS page_path text,
  ADD COLUMN IF NOT EXISTS page_type text DEFAULT 'report' CHECK (page_type IN ('report', 'marketing'));

-- Make report_id nullable since marketing pages won't have a report
ALTER TABLE public.report_views 
  ALTER COLUMN report_id DROP NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_report_views_page_type ON public.report_views(page_type);
CREATE INDEX IF NOT EXISTS idx_report_views_page_path ON public.report_views(page_path);

-- Update existing rows to have page_type = 'report'
UPDATE public.report_views 
SET page_type = 'report' 
WHERE page_type IS NULL;