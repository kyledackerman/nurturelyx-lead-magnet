-- Create prospect_activities for orphaned anonymous self-service reports
INSERT INTO prospect_activities (
  report_id,
  activity_type,
  status,
  priority,
  lead_source,
  assigned_to,
  notes,
  created_at,
  updated_at
)
SELECT 
  r.id,
  'note',
  'review',
  CASE 
    WHEN (r.report_data->>'missedLeads')::integer >= 1000 THEN 'hot'
    WHEN (r.report_data->>'missedLeads')::integer >= 500 THEN 'warm'
    ELSE 'cold'
  END,
  'warm_inbound',
  NULL,
  '🔥 BACKFILLED: Warm inbound lead from self-service report on ' || r.created_at::date,
  r.created_at,
  NOW()
FROM reports r
WHERE r.user_id IS NULL 
  AND r.import_source IS NULL
  AND r.lead_source = 'self_service'
  AND NOT EXISTS (
    SELECT 1 FROM prospect_activities pa WHERE pa.report_id = r.id
  );