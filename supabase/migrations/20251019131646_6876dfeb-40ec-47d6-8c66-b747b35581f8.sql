-- Create trigger to auto-create client accounts when prospects are won
CREATE TRIGGER auto_create_client_on_won
  AFTER UPDATE OF status ON prospect_activities
  FOR EACH ROW
  WHEN (NEW.status = 'closed_won' AND (OLD.status IS DISTINCT FROM 'closed_won'))
  EXECUTE FUNCTION auto_create_client_account();

-- Backfill: Create client accounts for existing closed_won prospects
INSERT INTO client_accounts (
  prospect_activity_id,
  report_id,
  company_name,
  domain,
  status,
  health_score,
  contract_start_date,
  assigned_csm
)
SELECT 
  pa.id,
  pa.report_id,
  COALESCE(r.extracted_company_name, r.domain),
  r.domain,
  'onboarding'::client_status,
  100,
  COALESCE(pa.closed_at, NOW()),
  pa.assigned_to
FROM prospect_activities pa
JOIN reports r ON r.id = pa.report_id
WHERE pa.status = 'closed_won'
  AND NOT EXISTS (
    SELECT 1 FROM client_accounts ca 
    WHERE ca.prospect_activity_id = pa.id
  );

-- Create implementation records for the new clients
INSERT INTO client_implementation (
  client_account_id,
  implementation_status
)
SELECT 
  ca.id,
  'not_started'::implementation_status
FROM client_accounts ca
WHERE NOT EXISTS (
  SELECT 1 FROM client_implementation ci 
  WHERE ci.client_account_id = ca.id
);

-- Log the backfill in audit trail
INSERT INTO audit_logs (
  table_name,
  record_id,
  action_type,
  field_name,
  old_value,
  new_value,
  business_context
)
SELECT 
  'client_accounts',
  ca.id,
  'INSERT',
  'status',
  NULL,
  'onboarding',
  'Backfilled from closed_won prospect: ' || ca.domain
FROM client_accounts ca
WHERE ca.created_at >= NOW() - INTERVAL '1 minute';