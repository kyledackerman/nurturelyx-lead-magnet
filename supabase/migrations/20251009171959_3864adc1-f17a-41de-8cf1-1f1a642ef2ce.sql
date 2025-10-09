-- ===================================
-- PHASE 1: CRITICAL PERFORMANCE FIXES
-- ===================================

-- 1. Add database indexes for critical filter columns
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status ON prospect_activities(status);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_assigned ON prospect_activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_status_priority ON prospect_activities(status, priority, assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospect_activities_enrichment_queue 
  ON prospect_activities(status, enrichment_retry_count, last_enrichment_attempt)
  WHERE status IN ('new', 'enriching', 'review');

-- 2. Add contact_count column to prospect_activities for denormalization
ALTER TABLE prospect_activities ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;

-- 3. Create trigger to maintain contact counts automatically
CREATE OR REPLACE FUNCTION update_prospect_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prospect_activities
    SET contact_count = (
      SELECT COUNT(*) 
      FROM prospect_contacts 
      WHERE prospect_activity_id = NEW.prospect_activity_id
    )
    WHERE id = NEW.prospect_activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prospect_activities
    SET contact_count = (
      SELECT COUNT(*) 
      FROM prospect_contacts 
      WHERE prospect_activity_id = OLD.prospect_activity_id
    )
    WHERE id = OLD.prospect_activity_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_contact_count_insert
AFTER INSERT ON prospect_contacts
FOR EACH ROW EXECUTE FUNCTION update_prospect_contact_count();

CREATE TRIGGER trg_update_contact_count_delete
AFTER DELETE ON prospect_contacts
FOR EACH ROW EXECUTE FUNCTION update_prospect_contact_count();

-- 4. Backfill existing contact counts
UPDATE prospect_activities pa
SET contact_count = (
  SELECT COUNT(*) 
  FROM prospect_contacts pc 
  WHERE pc.prospect_activity_id = pa.id
);

-- 5. Create optimized database function to fetch CRM prospects with stats in ONE query
CREATE OR REPLACE FUNCTION get_crm_prospects_with_stats(
  p_status_filter text[] DEFAULT NULL,
  p_assigned_filter uuid DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  report_id uuid,
  domain text,
  slug text,
  status text,
  priority text,
  assigned_to uuid,
  lost_reason text,
  lost_notes text,
  icebreaker_text text,
  contact_count bigint,
  company_name text,
  monthly_revenue numeric,
  missed_leads integer,
  traffic_tier text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.report_id,
    r.domain,
    r.slug,
    pa.status,
    pa.priority,
    pa.assigned_to,
    pa.lost_reason,
    pa.lost_notes,
    pa.icebreaker_text,
    pa.contact_count::bigint,
    r.extracted_company_name,
    (r.report_data->>'monthlyRevenueLost')::numeric,
    (r.report_data->>'missedLeads')::integer,
    CASE
      WHEN (r.report_data->>'organicTraffic')::numeric < 10000 THEN 'low'
      WHEN (r.report_data->>'organicTraffic')::numeric < 100000 THEN 'medium'
      WHEN (r.report_data->>'organicTraffic')::numeric < 500000 THEN 'high'
      ELSE 'enterprise'
    END as traffic_tier,
    pa.created_at,
    pa.updated_at
  FROM prospect_activities pa
  INNER JOIN reports r ON pa.report_id = r.id
  WHERE (p_status_filter IS NULL OR pa.status = ANY(p_status_filter))
    AND (p_assigned_filter IS NULL OR pa.assigned_to = p_assigned_filter)
  ORDER BY 
    CASE pa.priority 
      WHEN 'hot' THEN 3
      WHEN 'warm' THEN 2
      WHEN 'cold' THEN 1
      ELSE 0
    END DESC,
    (r.report_data->>'monthlyRevenueLost')::numeric DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ===================================
-- PHASE 2: ENRICHMENT RELIABILITY
-- ===================================

-- 6. Add enrichment locking columns to prevent race conditions
ALTER TABLE prospect_activities ADD COLUMN IF NOT EXISTS enrichment_locked_at TIMESTAMPTZ;
ALTER TABLE prospect_activities ADD COLUMN IF NOT EXISTS enrichment_locked_by TEXT;

-- 7. Create function to acquire enrichment lock
CREATE OR REPLACE FUNCTION acquire_enrichment_lock(
  p_prospect_id UUID,
  p_source TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  lock_acquired BOOLEAN := FALSE;
BEGIN
  UPDATE prospect_activities
  SET 
    enrichment_locked_at = NOW(),
    enrichment_locked_by = p_source,
    status = 'enriching'
  WHERE id = p_prospect_id
    AND (enrichment_locked_at IS NULL 
         OR enrichment_locked_at < NOW() - INTERVAL '10 minutes')
  RETURNING TRUE INTO lock_acquired;
  
  RETURN COALESCE(lock_acquired, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Create function to release enrichment lock
CREATE OR REPLACE FUNCTION release_enrichment_lock(
  p_prospect_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE prospect_activities
  SET 
    enrichment_locked_at = NULL,
    enrichment_locked_by = NULL
  WHERE id = p_prospect_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===================================
-- PHASE 3: ICEBREAKER HISTORY
-- ===================================

-- 9. Add column to save previous icebreaker for rollback
ALTER TABLE prospect_activities ADD COLUMN IF NOT EXISTS icebreaker_previous TEXT;

-- ===================================
-- PHASE 4: IMPROVED STATUS TRACKING
-- ===================================

-- 10. Create enrichment_failed status for prospects that permanently fail
-- This is just adding the new status value - the existing check constraint allows any text
-- The application code will handle validation of allowed statuses

-- 11. Add index for enrichment failure tracking
CREATE INDEX IF NOT EXISTS idx_prospect_activities_enrichment_failed
  ON prospect_activities(enrichment_retry_count, last_enrichment_attempt)
  WHERE status = 'enriching' OR status = 'review';