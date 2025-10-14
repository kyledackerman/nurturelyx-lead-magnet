-- Fix contact counting to only count contacts WITH email addresses
CREATE OR REPLACE FUNCTION public.update_prospect_contact_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prospect_activities
    SET contact_count = (
      SELECT COUNT(*) 
      FROM prospect_contacts 
      WHERE prospect_activity_id = NEW.prospect_activity_id
        AND email IS NOT NULL 
        AND email != ''
    )
    WHERE id = NEW.prospect_activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prospect_activities
    SET contact_count = (
      SELECT COUNT(*) 
      FROM prospect_contacts 
      WHERE prospect_activity_id = OLD.prospect_activity_id
        AND email IS NOT NULL
        AND email != ''
    )
    WHERE id = OLD.prospect_activity_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle email updates - if email is added or removed, update count
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      UPDATE prospect_activities
      SET contact_count = (
        SELECT COUNT(*) 
        FROM prospect_contacts 
        WHERE prospect_activity_id = NEW.prospect_activity_id
          AND email IS NOT NULL
          AND email != ''
      )
      WHERE id = NEW.prospect_activity_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create function to validate that enriched prospects actually have email contacts
CREATE OR REPLACE FUNCTION public.validate_prospect_email_contacts()
RETURNS TABLE(moved_count integer, moved_prospect_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  moved_count INTEGER := 0;
  moved_ids uuid[];
BEGIN
  -- Find prospects marked as "enriched" but with no email contacts
  WITH updated_prospects AS (
    UPDATE prospect_activities pa
    SET 
      status = 'review',
      updated_at = NOW()
    WHERE 
      pa.status = 'enriched'
      AND NOT EXISTS (
        SELECT 1 
        FROM prospect_contacts pc 
        WHERE pc.prospect_activity_id = pa.id 
          AND pc.email IS NOT NULL 
          AND pc.email != ''
      )
    RETURNING pa.id, pa.report_id
  )
  SELECT 
    COUNT(*)::integer,
    ARRAY_AGG(id)
  INTO moved_count, moved_ids
  FROM updated_prospects;
  
  -- Log to audit trail for each moved prospect
  IF moved_count > 0 THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action_type,
      field_name,
      old_value,
      new_value,
      business_context,
      changed_by
    )
    SELECT
      'prospect_activities',
      id,
      'UPDATE',
      'status',
      'enriched',
      'review',
      'Email validation: No valid email contacts found, moved back to review',
      auth.uid()
    FROM unnest(moved_ids) AS id;
  END IF;
  
  RETURN QUERY SELECT moved_count, moved_ids;
END;
$function$;