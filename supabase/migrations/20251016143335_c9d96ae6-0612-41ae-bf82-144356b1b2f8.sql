-- Create RPC to get accurate conversion funnel metrics (subset-safe, no 1000-row limit)
CREATE OR REPLACE FUNCTION public.get_crm_funnel_metrics()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH valid_contacts AS (
  SELECT
    pc.prospect_activity_id,
    pc.report_id
  FROM prospect_contacts pc
  WHERE pc.email IS NOT NULL
    AND TRIM(pc.email) <> ''
    AND NOT (
      LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca'
      OR LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$'
    )
),
domain_rollup AS (
  SELECT
    r.domain,
    BOOL_OR(v.prospect_activity_id IS NOT NULL AND pa.icebreaker_text IS NOT NULL) AS is_enriched,
    BOOL_OR(pa.status IN ('contacted','interested','proposal','closed_won')) AS is_contacted,
    BOOL_OR(pa.status = 'closed_won') AS is_won
  FROM prospect_activities pa
  JOIN reports r ON r.id = pa.report_id
  LEFT JOIN valid_contacts v ON v.prospect_activity_id = pa.id
  GROUP BY r.domain
),
metrics AS (
  SELECT
    COUNT(*)::int AS total_domains,
    COUNT(*) FILTER (WHERE is_enriched)::int AS enriched_domains,
    COUNT(*) FILTER (WHERE is_enriched AND is_contacted)::int AS contacted_domains,
    COUNT(*) FILTER (WHERE is_won)::int AS won_domains
  FROM domain_rollup
)
SELECT jsonb_build_object(
  'totalDomains', total_domains,
  'enrichedDomains', enriched_domains,
  'contactedDomains', contacted_domains,
  'wonDomains', won_domains,
  'enrichmentRate', CASE WHEN total_domains > 0 THEN ROUND((enriched_domains::numeric / total_domains::numeric)*100, 2) ELSE 0 END,
  'contactRate', CASE WHEN enriched_domains > 0 THEN ROUND((contacted_domains::numeric / enriched_domains::numeric)*100, 2) ELSE 0 END,
  'winRate', CASE WHEN contacted_domains > 0 THEN ROUND((won_domains::numeric / contacted_domains::numeric)*100, 2) ELSE 0 END,
  'overallConversion', CASE WHEN total_domains > 0 THEN ROUND((won_domains::numeric / total_domains::numeric)*100, 2) ELSE 0 END
)
FROM metrics;
$$;

-- Create RPC to get domain counts by pipeline status (each domain counted once by highest status)
CREATE OR REPLACE FUNCTION public.get_pipeline_status_domain_counts()
RETURNS TABLE(status text, domain_count integer, total_value numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH status_rank AS (
  SELECT 'new' AS status, 1 AS ord UNION ALL
  SELECT 'review', 2 UNION ALL
  SELECT 'enriching', 3 UNION ALL
  SELECT 'enriched', 4 UNION ALL
  SELECT 'contacted', 5 UNION ALL
  SELECT 'interested', 6 UNION ALL
  SELECT 'proposal', 7 UNION ALL
  SELECT 'closed_won', 8 UNION ALL
  SELECT 'closed_lost', 9 UNION ALL
  SELECT 'not_viable', 10 UNION ALL
  SELECT 'on_hold', 11
),
domain_status AS (
  SELECT
    r.domain,
    (ARRAY_AGG(pa.status ORDER BY sr.ord DESC))[1] AS top_status,
    MAX((r.report_data->>'monthlyRevenueLost')::numeric) AS revenue
  FROM prospect_activities pa
  JOIN reports r ON r.id = pa.report_id
  JOIN status_rank sr ON sr.status = pa.status
  GROUP BY r.domain
)
SELECT 
  top_status AS status, 
  COUNT(*)::int AS domain_count,
  COALESCE(SUM(revenue), 0) AS total_value
FROM domain_status
GROUP BY top_status;
$$;

-- Create RPC to get daily unique domains enriched (last N days)
CREATE OR REPLACE FUNCTION public.get_daily_unique_domains_enriched(days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH valid_contacts AS (
  SELECT
    pc.prospect_activity_id,
    pc.report_id,
    pc.created_at
  FROM prospect_contacts pc
  WHERE pc.email IS NOT NULL
    AND TRIM(pc.email) <> ''
    AND NOT (
      LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca'
      OR LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$'
    )
),
domain_enriched_first AS (
  SELECT
    r.domain,
    DATE(MIN(GREATEST(v.created_at, COALESCE(pa.icebreaker_generated_at, pa.updated_at)))) AS enriched_date
  FROM prospect_activities pa
  JOIN reports r ON r.id = pa.report_id
  JOIN valid_contacts v ON v.prospect_activity_id = pa.id
  WHERE pa.icebreaker_text IS NOT NULL
  GROUP BY r.domain
),
series AS (
  SELECT generate_series(
    DATE_TRUNC('day', NOW())::date - (days::int - 1),
    DATE_TRUNC('day', NOW())::date,
    '1 day'::interval
  )::date AS day
),
daily AS (
  SELECT s.day, COUNT(de.domain)::int AS cnt
  FROM series s
  LEFT JOIN domain_enriched_first de ON de.enriched_date = s.day
  GROUP BY s.day
  ORDER BY s.day
)
SELECT COALESCE(
  jsonb_agg(
    jsonb_build_object(
      'date', to_char(day, 'YYYY-MM-DD'),
      'count', cnt
    ) ORDER BY day
  ),
  '[]'::jsonb
)
FROM daily;
$$;

-- Create RPC to get daily unique domains contacted (last N days)
CREATE OR REPLACE FUNCTION public.get_daily_unique_domains_contacted(days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
WITH status_changes AS (
  SELECT
    al.record_id AS prospect_id,
    DATE_TRUNC('day', al.changed_at)::date AS day
  FROM audit_logs al
  WHERE al.table_name = 'prospect_activities'
    AND al.field_name = 'status'
    AND al.new_value IN ('contacted','interested','proposal','closed_won')
    AND al.changed_at >= NOW() - (days || ' days')::interval
),
contacted_domains AS (
  SELECT
    DATE(sc.day) AS day,
    r.domain
  FROM status_changes sc
  JOIN prospect_activities pa ON pa.id = sc.prospect_id
  JOIN reports r ON r.id = pa.report_id
),
series AS (
  SELECT generate_series(
    DATE_TRUNC('day', NOW())::date - (days::int - 1),
    DATE_TRUNC('day', NOW())::date,
    '1 day'::interval
  )::date AS day
),
daily AS (
  SELECT s.day, COUNT(DISTINCT cd.domain)::int AS cnt
  FROM series s
  LEFT JOIN contacted_domains cd ON cd.day = s.day
  GROUP BY s.day
  ORDER BY s.day
)
SELECT COALESCE(
  jsonb_agg(
    jsonb_build_object(
      'date', to_char(day, 'YYYY-MM-DD'),
      'count', cnt
    ) ORDER BY day
  ),
  '[]'::jsonb
)
FROM daily;
$$;