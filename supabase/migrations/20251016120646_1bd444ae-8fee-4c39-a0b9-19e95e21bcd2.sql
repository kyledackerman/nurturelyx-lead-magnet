-- Create a robust server-side hot streak calculator
-- Computes currentStreak, longestStreak, and isActive using UTC dates
CREATE OR REPLACE FUNCTION public.get_hot_streak()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
WITH days AS (
  SELECT DISTINCT (created_at)::date AS day
  FROM public.reports
),
ordered AS (
  SELECT day, ROW_NUMBER() OVER (ORDER BY day) AS rn
  FROM days
),
islands AS (
  SELECT day, rn, (day - rn::int) AS grp
  FROM ordered
),
"groups" AS (
  SELECT grp, MIN(day) AS start_day, MAX(day) AS end_day, COUNT(*) AS len
  FROM islands
  GROUP BY grp
),
active_day AS (
  SELECT CASE
           WHEN EXISTS (SELECT 1 FROM days WHERE day = CURRENT_DATE) THEN CURRENT_DATE
           WHEN EXISTS (SELECT 1 FROM days WHERE day = CURRENT_DATE - INTERVAL '1 day') THEN CURRENT_DATE - INTERVAL '1 day'
           ELSE NULL
         END::date AS day
),
current_run AS (
  SELECT g.len
  FROM "groups" g
  JOIN active_day a ON a.day BETWEEN g.start_day AND g.end_day
)
SELECT jsonb_build_object(
  'currentStreak', COALESCE((SELECT len FROM current_run LIMIT 1), 0),
  'longestStreak', COALESCE((SELECT MAX(len) FROM "groups"), 0),
  'isActive', COALESCE((SELECT (day IS NOT NULL) FROM active_day), false)
);
$$;