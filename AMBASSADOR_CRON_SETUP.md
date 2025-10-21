# Ambassador Commission Eligibility - Cron Job Setup

## Overview
This document contains the SQL commands to set up the automated daily check for commission eligibility. This cron job runs daily at 2 AM UTC to check for commissions that have passed the 60-day hold period and move them from "pending" to "eligible" status.

## Prerequisites
- Supabase project must have `pg_cron` and `pg_net` extensions enabled
- The `check-commission-eligibility` edge function must be deployed

## Installation Instructions

### Step 1: Enable Required Extensions
Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Create the Daily Cron Job
Run this SQL to schedule the daily check at 2 AM UTC:

```sql
-- Create cron job to run daily at 2 AM UTC
SELECT cron.schedule(
  'check-commission-eligibility-daily',
  '0 2 * * *', -- Daily at 2 AM UTC (9 PM EST / 6 PM PST)
  $$
  SELECT net.http_post(
    url:='https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/check-commission-eligibility',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job
Check that the job was created successfully:

```sql
-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'check-commission-eligibility-daily';
```

You should see one row with:
- `jobname`: check-commission-eligibility-daily
- `schedule`: 0 2 * * *
- `active`: true

## Testing

### Manual Trigger for Testing
To test the cron job immediately without waiting for 2 AM:

```sql
-- Create a temporary test job that runs every minute
SELECT cron.schedule(
  'test-commission-check-now',
  '* * * * *', -- Run every minute (for testing)
  $$
  SELECT net.http_post(
    url:='https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/check-commission-eligibility',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

Wait 1-2 minutes, then check the execution history:

```sql
-- Check cron job history (shows results)
SELECT * FROM cron.job_run_details 
WHERE jobname = 'test-commission-check-now' 
ORDER BY start_time DESC 
LIMIT 10;
```

After testing is complete, **remove the test job**:

```sql
-- Unschedule the test job
SELECT cron.unschedule('test-commission-check-now');
```

### Check Edge Function Logs
You can also check the edge function logs in Supabase:
1. Go to https://supabase.com/dashboard/project/apjlauuidcbvuplfcshg/functions/check-commission-eligibility/logs
2. Look for successful executions and any commissions processed

## Monitoring

### View Recent Executions
Check the cron job execution history:

```sql
-- View recent cron job runs
SELECT 
  jobname,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobname = 'check-commission-eligibility-daily'
ORDER BY start_time DESC 
LIMIT 20;
```

### Expected Behavior
- The job runs at 2 AM UTC every day
- If there are no eligible commissions, it returns: `{"commissions_processed": 0}`
- If commissions are processed, it returns the count and emails are sent

## Troubleshooting

### Job Not Running
```sql
-- Check if job is active
SELECT * FROM cron.job WHERE jobname = 'check-commission-eligibility-daily';

-- If job exists but not running, recreate it by first unscheduling:
SELECT cron.unschedule('check-commission-eligibility-daily');
-- Then run Step 2 again
```

### Check for Errors
```sql
-- Look for failed executions
SELECT * FROM cron.job_run_details 
WHERE jobname = 'check-commission-eligibility-daily'
  AND status != 'succeeded'
ORDER BY start_time DESC;
```

### Manually Invoke the Function
You can also manually test the edge function directly:
1. Go to https://supabase.com/dashboard/project/apjlauuidcbvuplfcshg/functions/check-commission-eligibility
2. Click "Invoke" button
3. Send an empty JSON body: `{}`

## Uninstalling

If you need to remove the cron job:

```sql
-- Remove the daily cron job
SELECT cron.unschedule('check-commission-eligibility-daily');

-- Verify it's gone
SELECT * FROM cron.job WHERE jobname = 'check-commission-eligibility-daily';
```

## Schedule Details

- **Frequency**: Daily at 2:00 AM UTC
- **Timezone**: UTC (9 PM EST / 6 PM PST on previous day)
- **Cron Expression**: `0 2 * * *`
  - Minute: 0
  - Hour: 2
  - Day of month: * (every day)
  - Month: * (every month)
  - Day of week: * (every day of week)

## What This Cron Job Does

1. Finds all `pending` platform fee commissions
2. Checks if `first_lead_delivered_at` was ≥60 days ago
3. Updates status from `pending` → `eligible`
4. Moves commission amounts from `pending_commission` → `eligible_commission` in ambassador profiles
5. Sends email notifications to ambassadors

## Commission Flow Overview

```
Client Signs Up
    ↓
Platform Fee Commission Created (status: pending)
    ↓
First Lead Delivered (first_lead_delivered_at set)
    ↓
Wait 60 Days...
    ↓
[THIS CRON JOB] Marks as Eligible + Sends Email
    ↓
Ambassador Can Request Payout (if total ≥ $100)
```
