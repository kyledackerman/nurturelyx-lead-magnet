-- Create function to auto-promote prospects to enriched when valid email is added
CREATE OR REPLACE FUNCTION auto_promote_to_enriched()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_icebreaker boolean;
  v_current_status text;
  v_domain text;
BEGIN
  -- Only act on INSERT or UPDATE where email is added/changed
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email))
     AND NEW.email IS NOT NULL 
     AND TRIM(NEW.email) != '' THEN
    
    -- Check if prospect has icebreaker and current status
    SELECT 
      pa.icebreaker_text IS NOT NULL,
      pa.status,
      r.domain
    INTO v_has_icebreaker, v_current_status, v_domain
    FROM prospect_activities pa
    INNER JOIN reports r ON r.id = pa.report_id
    WHERE pa.id = NEW.prospect_activity_id;
    
    -- Only promote if:
    -- 1. Has icebreaker
    -- 2. Not already enriched
    -- 3. Not in closed/lost statuses
    -- 4. Email is not legal/compliance (check prefix)
    IF v_has_icebreaker 
       AND v_current_status NOT IN ('enriched', 'closed_won', 'closed_lost', 'not_viable')
       AND NOT (LOWER(SPLIT_PART(NEW.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca') THEN
      
      UPDATE prospect_activities
      SET 
        status = 'enriched',
        enrichment_locked_at = NULL,
        enrichment_locked_by = NULL,
        updated_at = NOW()
      WHERE id = NEW.prospect_activity_id;
      
      -- Log audit trail
      INSERT INTO audit_logs (
        table_name, record_id, action_type, field_name,
        old_value, new_value, business_context
      ) VALUES (
        'prospect_activities', NEW.prospect_activity_id, 'UPDATE', 'status',
        v_current_status, 'enriched',
        'Auto-promoted to enriched: valid email added + icebreaker exists (' || v_domain || ')'
      );
      
      RAISE NOTICE 'Auto-promoted % to enriched (email: %)', v_domain, NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on prospect_contacts
DROP TRIGGER IF EXISTS trigger_auto_promote_enriched ON prospect_contacts;
CREATE TRIGGER trigger_auto_promote_enriched
AFTER INSERT OR UPDATE ON prospect_contacts
FOR EACH ROW
EXECUTE FUNCTION auto_promote_to_enriched();

-- Immediate fix for three misclassified prospects
UPDATE prospect_activities pa
SET 
  status = 'enriched',
  enrichment_locked_at = NULL,
  enrichment_locked_by = NULL,
  updated_at = NOW()
FROM reports r
WHERE pa.report_id = r.id
  AND r.domain IN ('reliantplumbing.com', 'ua.edu', 'worthavegroup.com')
  AND pa.status != 'enriched'
  AND EXISTS (
    SELECT 1 FROM prospect_contacts pc 
    WHERE pc.prospect_activity_id = pa.id 
      AND pc.email IS NOT NULL 
      AND TRIM(pc.email) != ''
      AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
  )
  AND pa.icebreaker_text IS NOT NULL;