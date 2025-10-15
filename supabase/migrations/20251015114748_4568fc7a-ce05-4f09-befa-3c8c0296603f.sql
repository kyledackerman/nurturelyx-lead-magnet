-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_yearly_revenue ON public.reports(((report_data->>'yearlyRevenueLost')::numeric));
CREATE INDEX IF NOT EXISTS idx_reports_missed_leads ON public.reports(((report_data->>'missedLeads')::integer));

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_report_views_viewed_at ON public.report_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_report_views_session_id ON public.report_views(session_id);
CREATE INDEX IF NOT EXISTS idx_report_views_report_id ON public.report_views(report_id);

CREATE INDEX IF NOT EXISTS idx_report_shares_shared_at ON public.report_shares(shared_at);
CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON public.report_shares(report_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_platform ON public.report_shares(platform);

-- Function 1: get_chart_data
-- Groups report counts by day/month and splits admin vs non-admin + revenue line
CREATE OR REPLACE FUNCTION public.get_chart_data(period text DEFAULT 'monthly')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  start_date timestamp;
  date_trunc_format text;
BEGIN
  -- Determine date range and truncation format
  CASE period
    WHEN 'weekly' THEN
      start_date := now() - interval '7 days';
      date_trunc_format := 'day';
    WHEN 'yearly' THEN
      start_date := now() - interval '12 months';
      date_trunc_format := 'month';
    ELSE -- monthly
      start_date := now() - interval '30 days';
      date_trunc_format := 'day';
  END CASE;

  -- Aggregate data
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', to_char(date_bucket, 'YYYY-MM-DD'),
      'adminReports', COALESCE(admin_count, 0),
      'nonAdminReports', COALESCE(non_admin_count, 0),
      'revenueLineReports', COALESCE(revenue_sum, 0)
    )
    ORDER BY date_bucket
  ) INTO result
  FROM (
    SELECT
      date_trunc(date_trunc_format, r.created_at) as date_bucket,
      COUNT(*) FILTER (WHERE ur.role IN ('admin', 'super_admin')) as admin_count,
      COUNT(*) FILTER (WHERE ur.role IS NULL OR ur.role NOT IN ('admin', 'super_admin')) as non_admin_count,
      SUM((r.report_data->>'yearlyRevenueLost')::numeric) FILTER (WHERE (r.report_data->>'yearlyRevenueLost') IS NOT NULL) as revenue_sum
    FROM public.reports r
    LEFT JOIN public.user_roles ur ON r.user_id = ur.user_id
    WHERE r.created_at >= start_date
    GROUP BY date_bucket
  ) subq;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function 2: get_views_chart_data
-- Groups report_views by day/month with unique sessions and total views
CREATE OR REPLACE FUNCTION public.get_views_chart_data(period text DEFAULT 'monthly')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  start_date timestamp;
  date_trunc_format text;
BEGIN
  -- Determine date range and truncation format
  CASE period
    WHEN 'weekly' THEN
      start_date := now() - interval '7 days';
      date_trunc_format := 'day';
    WHEN 'yearly' THEN
      start_date := now() - interval '12 months';
      date_trunc_format := 'month';
    ELSE -- monthly
      start_date := now() - interval '30 days';
      date_trunc_format := 'day';
  END CASE;

  -- Aggregate data
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', to_char(date_bucket, 'YYYY-MM-DD'),
      'uniqueVisitors', COALESCE(unique_sessions, 0),
      'totalViews', COALESCE(total_views, 0)
    )
    ORDER BY date_bucket
  ) INTO result
  FROM (
    SELECT
      date_trunc(date_trunc_format, viewed_at) as date_bucket,
      COUNT(DISTINCT session_id) as unique_sessions,
      COUNT(*) as total_views
    FROM public.report_views
    WHERE viewed_at >= start_date
    GROUP BY date_bucket
  ) subq;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Function 3: get_average_deal_size
-- Computes average and median of yearlyRevenueLost
CREATE OR REPLACE FUNCTION public.get_average_deal_size()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'avgDealSize', COALESCE(AVG((report_data->>'yearlyRevenueLost')::numeric), 0),
    'medianDealSize', COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (report_data->>'yearlyRevenueLost')::numeric), 0)
  ) INTO result
  FROM public.reports
  WHERE (report_data->>'yearlyRevenueLost') IS NOT NULL
    AND (report_data->>'yearlyRevenueLost')::numeric > 0;

  RETURN result;
END;
$$;

-- Function 4: get_total_market_opportunity
-- Sums total yearlyRevenueLost, counts active prospects, and calculates avg per prospect
CREATE OR REPLACE FUNCTION public.get_total_market_opportunity()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalOpportunity', COALESCE(SUM((report_data->>'yearlyRevenueLost')::numeric), 0),
    'activeProspects', COUNT(*),
    'avgPerProspect', CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(AVG((report_data->>'yearlyRevenueLost')::numeric), 0)
      ELSE 0
    END
  ) INTO result
  FROM public.reports
  WHERE (report_data->>'yearlyRevenueLost') IS NOT NULL
    AND (report_data->>'yearlyRevenueLost')::numeric > 0;

  RETURN result;
END;
$$;

-- Function 5: get_top_revenue_domain
-- Finds domain with highest yearlyRevenueLost and returns monthly data for client-side processing
CREATE OR REPLACE FUNCTION public.get_top_revenue_domain()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'domain', domain,
    'yearlyRevenueLost', (report_data->>'yearlyRevenueLost')::numeric,
    'monthlyRevenueLost', (report_data->>'monthlyRevenueLost')::numeric,
    'monthlyData', report_data->'monthlyRevenueData',
    'createdAt', created_at
  ) INTO result
  FROM public.reports
  WHERE (report_data->>'yearlyRevenueLost') IS NOT NULL
    AND (report_data->>'yearlyRevenueLost')::numeric > 0
  ORDER BY (report_data->>'yearlyRevenueLost')::numeric DESC
  LIMIT 1;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function 6: get_top_leads_domain
-- Finds domain with highest missedLeads and returns monthly data for client-side processing
CREATE OR REPLACE FUNCTION public.get_top_leads_domain()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'domain', domain,
    'missedLeads', (report_data->>'missedLeads')::integer,
    'monthlyData', report_data->'monthlyRevenueData',
    'createdAt', created_at
  ) INTO result
  FROM public.reports
  WHERE (report_data->>'missedLeads') IS NOT NULL
    AND (report_data->>'missedLeads')::integer > 0
  ORDER BY (report_data->>'missedLeads')::integer DESC
  LIMIT 1;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function 7: get_peak_performance_day
-- Day with most reports created + percentage of total
CREATE OR REPLACE FUNCTION public.get_peak_performance_day()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_reports integer;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_reports FROM public.reports;

  -- Find peak day
  SELECT jsonb_build_object(
    'date', to_char(date_bucket, 'YYYY-MM-DD'),
    'count', day_count,
    'percentageOfTotal', CASE 
      WHEN total_reports > 0 THEN ROUND((day_count::numeric / total_reports::numeric) * 100, 2)
      ELSE 0
    END
  ) INTO result
  FROM (
    SELECT
      date_trunc('day', created_at) as date_bucket,
      COUNT(*) as day_count
    FROM public.reports
    GROUP BY date_bucket
    ORDER BY day_count DESC
    LIMIT 1
  ) subq;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Function 8: get_quality_score
-- Percentage of "high-impact" reports (yearlyRevenueLost > 500000 OR missedLeads > 1000)
CREATE OR REPLACE FUNCTION public.get_quality_score()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  total_count integer;
  high_impact_count integer;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM public.reports;

  -- Get high impact count
  SELECT COUNT(*) INTO high_impact_count
  FROM public.reports
  WHERE ((report_data->>'yearlyRevenueLost')::numeric > 500000)
     OR ((report_data->>'missedLeads')::integer > 1000);

  -- Build result
  SELECT jsonb_build_object(
    'highImpactCount', high_impact_count,
    'totalCount', total_count,
    'percentage', CASE 
      WHEN total_count > 0 THEN ROUND((high_impact_count::numeric / total_count::numeric) * 100, 2)
      ELSE 0
    END
  ) INTO result;

  RETURN result;
END;
$$;