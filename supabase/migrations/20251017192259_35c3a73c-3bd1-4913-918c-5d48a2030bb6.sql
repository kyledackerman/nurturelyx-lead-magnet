-- Update auto-enrichment cron schedule from 10 minutes to 7 minutes
-- This increases throughput from ~90 to ~128 prospects/hour
SELECT cron.alter_job(
  job_id := 4,
  schedule := '*/7 * * * *'
);