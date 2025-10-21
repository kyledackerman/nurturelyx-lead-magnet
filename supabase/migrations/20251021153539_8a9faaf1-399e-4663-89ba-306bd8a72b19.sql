-- Helper function to check if user is ambassador
CREATE OR REPLACE FUNCTION is_ambassador(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid
    AND role = 'ambassador'
  );
$$;

-- Trigger 1: Auto-mark commissions as eligible after 60-day hold
CREATE OR REPLACE FUNCTION auto_mark_commission_eligible()
RETURNS TRIGGER AS $$
BEGIN
  -- After 60 days from first lead, mark as eligible
  IF NEW.first_lead_delivered_at IS NOT NULL 
     AND NEW.eligible_for_payout_at IS NULL THEN
    NEW.eligible_for_payout_at := NEW.first_lead_delivered_at + INTERVAL '60 days';
  END IF;
  
  -- If eligible date has passed, auto-update status
  IF NEW.eligible_for_payout_at IS NOT NULL
     AND NEW.eligible_for_payout_at <= NOW() 
     AND NEW.status = 'pending' THEN
    NEW.status := 'eligible';
    
    -- Update ambassador profile balances
    UPDATE ambassador_profiles
    SET 
      pending_commission = pending_commission - NEW.commission_amount,
      eligible_commission = eligible_commission + NEW.commission_amount,
      updated_at = NOW()
    WHERE user_id = NEW.ambassador_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER commission_eligibility_trigger
  BEFORE INSERT OR UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_commission_eligible();

-- Trigger 2: Auto-increment signup count when prospect closes
CREATE OR REPLACE FUNCTION increment_ambassador_signups()
RETURNS TRIGGER AS $$
BEGIN
  -- When prospect moves to closed_won, increment signup count
  IF NEW.status = 'closed_won' 
     AND (OLD.status IS NULL OR OLD.status != 'closed_won')
     AND NEW.purchased_by_ambassador IS NOT NULL THEN
    
    UPDATE ambassador_profiles
    SET 
      total_signups_lifetime = total_signups_lifetime + 1,
      updated_at = NOW()
    WHERE user_id = NEW.purchased_by_ambassador;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prospect_signup_counter
  AFTER UPDATE ON prospect_activities
  FOR EACH ROW
  EXECUTE FUNCTION increment_ambassador_signups();