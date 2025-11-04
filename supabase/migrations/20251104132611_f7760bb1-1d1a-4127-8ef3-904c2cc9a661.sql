-- Create RPC function to calculate conversion health metrics
CREATE OR REPLACE FUNCTION public.get_conversion_health()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH stats AS (
    SELECT 
      COUNT(*)::bigint as total_reports,
      COUNT(DISTINCT pa.report_id)::bigint as reports_in_crm
    FROM reports r
    LEFT JOIN prospect_activities pa ON pa.report_id = r.id
  )
  SELECT jsonb_build_object(
    'totalReports', total_reports,
    'reportsInCRM', reports_in_crm,
    'conversionRate', CASE 
      WHEN total_reports > 0 THEN ROUND((reports_in_crm::numeric / total_reports::numeric) * 100, 2)
      ELSE 0 
    END
  )
  FROM stats;
$function$;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION public.get_conversion_health() TO authenticated;