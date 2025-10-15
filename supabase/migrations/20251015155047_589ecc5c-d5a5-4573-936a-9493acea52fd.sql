-- Fix the high-value domains line to count domains instead of summing revenue
CREATE OR REPLACE FUNCTION public.get_chart_data(period text DEFAULT 'monthly'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      'revenueLineReports', COALESCE(high_value_count, 0)
    )
    ORDER BY date_bucket
  ) INTO result
  FROM (
    SELECT
      date_trunc(date_trunc_format, r.created_at) as date_bucket,
      COUNT(*) FILTER (WHERE ur.role IN ('admin', 'super_admin')) as admin_count,
      COUNT(*) FILTER (WHERE ur.role IS NULL OR ur.role NOT IN ('admin', 'super_admin')) as non_admin_count,
      COUNT(*) FILTER (WHERE (r.report_data->>'yearlyRevenueLost')::numeric > 500000) as high_value_count
    FROM public.reports r
    LEFT JOIN public.user_roles ur ON r.user_id = ur.user_id
    WHERE r.created_at >= start_date
    GROUP BY date_bucket
  ) subq;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$function$;