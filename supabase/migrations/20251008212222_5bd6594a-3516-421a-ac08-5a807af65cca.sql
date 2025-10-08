-- Create cron job to run auto-enrichment every 2 hours
-- This will process 12 prospects per run
SELECT cron.schedule(
  'auto-enrich-prospects-every-2-hours',
  '0 */2 * * *', -- Every 2 hours at the top of the hour
  $$
  SELECT
    net.http_post(
      url:='https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/auto-enrich-prospects',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'auto-enrich-prospects-every-2-hours';