-- Add trigger to auto-promote prospects when icebreaker is generated
-- This fixes the race condition where icebreaker completes after contacts are inserted

CREATE OR REPLACE FUNCTION public.check_prospect_enrichment_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_has_valid_email boolean;
  v_current_status text;
  v_domain text;
BEGIN
  -- Only act on UPDATE where icebreaker is added/changed
  IF (TG_OP = 'UPDATE' AND OLD.icebreaker_text IS DISTINCT FROM NEW.icebreaker_text)
     AND NEW.icebreaker_text IS NOT NULL 
     AND TRIM(NEW.icebreaker_text) != '' THEN
    
    -- Check if prospect has valid emails and current status
    SELECT 
      EXISTS(
        SELECT 1 
        FROM prospect_contacts pc
        WHERE pc.prospect_activity_id = NEW.id
          AND pc.email IS NOT NULL
          AND TRIM(pc.email) != ''
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 1)) ~ 'legal|privacy|compliance|counsel|attorney|law|dmca')
          AND NOT (LOWER(SPLIT_PART(pc.email, '@', 2)) ~ '\.gov$|\.edu$|\.mil$')
      ),
      NEW.status,
      r.domain
    INTO v_has_valid_email, v_current_status, v_domain
    FROM reports r
    WHERE r.id = NEW.report_id;
    
    -- Only promote if:
    -- 1. Has valid email contacts
    -- 2. Currently in enriching status
    -- 3. Not already in final statuses
    IF v_has_valid_email 
       AND v_current_status = 'enriching'
       AND v_current_status NOT IN ('enriched', 'closed_won', 'closed_lost', 'not_viable') THEN
      
      NEW.status := 'enriched';
      NEW.enrichment_locked_at := NULL;
      NEW.enrichment_locked_by := NULL;
      NEW.updated_at := NOW();
      
      -- Log audit trail
      INSERT INTO audit_logs (
        table_name, record_id, action_type, field_name,
        old_value, new_value, business_context
      ) VALUES (
        'prospect_activities', NEW.id, 'UPDATE', 'status',
        v_current_status, 'enriched',
        'Auto-promoted to enriched: icebreaker generated + valid emails exist (' || v_domain || ')'
      );
      
      RAISE NOTICE 'Auto-promoted % to enriched (icebreaker generated)', v_domain;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on prospect_activities
DROP TRIGGER IF EXISTS trigger_check_enrichment_complete ON prospect_activities;
CREATE TRIGGER trigger_check_enrichment_complete
  BEFORE UPDATE ON prospect_activities
  FOR EACH ROW
  EXECUTE FUNCTION check_prospect_enrichment_complete();