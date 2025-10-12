-- Enable pg_net extension required for cron jobs to make HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing job if it exists
SELECT cron.unschedule('auto-enrich-prospects-every-2-hours');

-- Create the cron job with proper syntax
SELECT cron.schedule(
  'auto-enrich-prospects-every-2-hours',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:='https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/auto-enrich-prospects',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);