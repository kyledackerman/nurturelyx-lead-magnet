-- Create re_enrichment_jobs table for tracking re-enrichment batches
CREATE TABLE IF NOT EXISTS public.re_enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_processed_at TIMESTAMP WITH TIME ZONE,
  total_count INTEGER NOT NULL,
  processed_count INTEGER DEFAULT 0 NOT NULL,
  enriched_count INTEGER DEFAULT 0 NOT NULL,
  not_found_count INTEGER DEFAULT 0 NOT NULL,
  error_count INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'queued' NOT NULL,
  stopped_reason TEXT,
  max_domains_to_process INTEGER NOT NULL,
  current_offset INTEGER DEFAULT 0 NOT NULL
);

-- Create re_enrichment_job_items table for tracking individual prospects
CREATE TABLE IF NOT EXISTS public.re_enrichment_job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.re_enrichment_jobs(id) ON DELETE CASCADE NOT NULL,
  prospect_activity_id UUID REFERENCES public.prospect_activities(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  report_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  owner_name_found TEXT,
  stage_reached TEXT,
  contacts_found INTEGER DEFAULT 0 NOT NULL,
  emails_extracted TEXT[],
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  search_queries_used INTEGER DEFAULT 0 NOT NULL
);

-- Enable RLS
ALTER TABLE public.re_enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.re_enrichment_job_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for re_enrichment_jobs
CREATE POLICY "Admins can view all re-enrichment jobs"
  ON public.re_enrichment_jobs FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create re-enrichment jobs"
  ON public.re_enrichment_jobs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update re-enrichment jobs"
  ON public.re_enrichment_jobs FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for re_enrichment_job_items
CREATE POLICY "Admins can view all re-enrichment job items"
  ON public.re_enrichment_job_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.re_enrichment_jobs
    WHERE re_enrichment_jobs.id = re_enrichment_job_items.job_id
    AND is_admin(auth.uid())
  ));

CREATE POLICY "System can insert re-enrichment job items"
  ON public.re_enrichment_job_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.re_enrichment_jobs
    WHERE re_enrichment_jobs.id = re_enrichment_job_items.job_id
    AND is_admin(auth.uid())
  ));

CREATE POLICY "System can update re-enrichment job items"
  ON public.re_enrichment_job_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.re_enrichment_jobs
    WHERE re_enrichment_jobs.id = re_enrichment_job_items.job_id
    AND is_admin(auth.uid())
  ));

-- Create indexes for performance
CREATE INDEX idx_re_enrichment_jobs_created_by ON public.re_enrichment_jobs(created_by);
CREATE INDEX idx_re_enrichment_jobs_status ON public.re_enrichment_jobs(status);
CREATE INDEX idx_re_enrichment_job_items_job_id ON public.re_enrichment_job_items(job_id);
CREATE INDEX idx_re_enrichment_job_items_status ON public.re_enrichment_job_items(status);

-- Enable realtime for job updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.re_enrichment_jobs;