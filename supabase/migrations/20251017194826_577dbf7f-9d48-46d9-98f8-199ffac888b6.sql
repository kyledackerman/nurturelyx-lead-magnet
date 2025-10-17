-- Update check_prospect_enrichment_complete trigger to verify all 3 criteria
CREATE OR REPLACE FUNCTION public.check_prospect_enrichment_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_has_valid_email boolean;
  v_has_company_name boolean;
  v_current_status text;
  v_domain text;
BEGIN
  -- Only act on UPDATE where icebreaker is added/changed
  IF (TG_OP = 'UPDATE' AND OLD.icebreaker_text IS DISTINCT FROM NEW.icebreaker_text)
     AND NEW.icebreaker_text IS NOT NULL 
     AND TRIM(NEW.icebreaker_text) != '' THEN
    
    -- Check if prospect has company name and valid emails
    SELECT 
      r.extracted_company_name IS NOT NULL,
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
    INTO v_has_company_name, v_has_valid_email, v_current_status, v_domain
    FROM reports r
    WHERE r.id = NEW.report_id;
    
    -- Only promote if: has company name + valid email + icebreaker + currently enriching
    IF v_has_company_name 
       AND v_has_valid_email 
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
        'Auto-promoted to enriched: company name + valid emails + icebreaker (' || v_domain || ')'
      );
      
      RAISE NOTICE 'Auto-promoted % to enriched (all 3 criteria met)', v_domain;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update auto_promote_to_enriched trigger to also verify company name exists
CREATE OR REPLACE FUNCTION public.auto_promote_to_enriched()
RETURNS TRIGGER AS $$
DECLARE
  v_has_icebreaker boolean;
  v_has_company_name boolean;
  v_current_status text;
  v_domain text;
BEGIN
  -- Only act on INSERT or UPDATE where email is added/changed
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email))
     AND NEW.email IS NOT NULL 
     AND TRIM(NEW.email) != '' THEN
    
    -- Check if prospect has icebreaker, company name, and current status
    SELECT 
      pa.icebreaker_text IS NOT NULL,
      r.extracted_company_name IS NOT NULL,
      pa.status,
      r.domain
    INTO v_has_icebreaker, v_has_company_name, v_current_status, v_domain
    FROM prospect_activities pa
    INNER JOIN reports r ON r.id = pa.report_id
    WHERE pa.id = NEW.prospect_activity_id;
    
    -- Only promote if:
    -- 1. Has company name
    -- 2. Has icebreaker
    -- 3. Not already enriched
    -- 4. Not in closed/lost statuses
    -- 5. Email is not legal/compliance (check prefix)
    IF v_has_company_name
       AND v_has_icebreaker 
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
        'Auto-promoted to enriched: company name + valid email added + icebreaker exists (' || v_domain || ')'
      );
      
      RAISE NOTICE 'Auto-promoted % to enriched (email: %)', v_domain, NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;