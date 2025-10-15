-- Create optimized function to calculate admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH report_stats AS (
    SELECT 
      -- Unique domains
      COUNT(DISTINCT r.domain) as unique_domains,
      COUNT(DISTINCT CASE WHEN DATE(r.created_at) = CURRENT_DATE THEN r.domain END) as unique_domains_today,
      COUNT(DISTINCT CASE WHEN DATE(r.created_at) = CURRENT_DATE - 1 THEN r.domain END) as unique_domains_yesterday,
      
      -- Admin reports
      COUNT(*) FILTER (WHERE ur.role IN ('admin', 'super_admin')) as admin_reports,
      COUNT(*) FILTER (WHERE ur.role IN ('admin', 'super_admin') AND DATE(r.created_at) = CURRENT_DATE) as admin_reports_today,
      COUNT(*) FILTER (WHERE ur.role IN ('admin', 'super_admin') AND DATE(r.created_at) = CURRENT_DATE - 1) as admin_reports_yesterday,
      
      -- Non-admin reports
      COUNT(*) FILTER (WHERE ur.role NOT IN ('admin', 'super_admin') OR ur.role IS NULL) as non_admin_reports,
      COUNT(*) FILTER (WHERE (ur.role NOT IN ('admin', 'super_admin') OR ur.role IS NULL) AND DATE(r.created_at) = CURRENT_DATE) as non_admin_reports_today,
      COUNT(*) FILTER (WHERE (ur.role NOT IN ('admin', 'super_admin') OR ur.role IS NULL) AND DATE(r.created_at) = CURRENT_DATE - 1) as non_admin_reports_yesterday,
      
      -- High-value prospects (monthly revenue lost > $5,000)
      COUNT(*) FILTER (WHERE (r.report_data->>'monthlyRevenueLost')::numeric > 5000) as high_value_prospects,
      COUNT(*) FILTER (WHERE (r.report_data->>'monthlyRevenueLost')::numeric > 5000 AND DATE(r.created_at) = CURRENT_DATE) as high_value_prospects_today,
      COUNT(*) FILTER (WHERE (r.report_data->>'monthlyRevenueLost')::numeric > 5000 AND DATE(r.created_at) = CURRENT_DATE - 1) as high_value_prospects_yesterday
      
    FROM reports r
    LEFT JOIN user_roles ur ON r.user_id = ur.user_id
  )
  SELECT jsonb_build_object(
    'uniqueDomains', unique_domains,
    'uniqueDomainsToday', unique_domains_today,
    'uniqueDomainsYesterday', unique_domains_yesterday,
    'adminReports', admin_reports,
    'adminReportsToday', admin_reports_today,
    'adminReportsYesterday', admin_reports_yesterday,
    'nonAdminReports', non_admin_reports,
    'nonAdminReportsToday', non_admin_reports_today,
    'nonAdminReportsYesterday', non_admin_reports_yesterday,
    'highValueProspects', high_value_prospects,
    'highValueProspectsToday', high_value_prospects_today,
    'highValueProspectsYesterday', high_value_prospects_yesterday
  ) FROM report_stats;
$$;