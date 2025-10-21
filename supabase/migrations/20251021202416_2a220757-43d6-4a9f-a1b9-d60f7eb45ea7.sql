-- Fix ambassador tier thresholds
-- Update the update_ambassador_tiers function to use correct thresholds:
-- Bronze: 0-99 signups/active
-- Silver: 100-999 signups/active  
-- Gold: 1000+ signups/active

CREATE OR REPLACE FUNCTION update_ambassador_tiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Update platform fee tier based on total_signups_lifetime
  -- Bronze: 0-99, Silver: 100-999, Gold: 1000+
  IF NEW.total_signups_lifetime >= 1000 THEN
    NEW.platform_fee_tier := 'gold';
  ELSIF NEW.total_signups_lifetime >= 100 THEN
    NEW.platform_fee_tier := 'silver';
  ELSE
    NEW.platform_fee_tier := 'bronze';
  END IF;
  
  -- Update per-lead tier based on active_domains_count
  -- Bronze: 0-99, Silver: 100-999, Gold: 1000+
  IF NEW.active_domains_count >= 1000 THEN
    NEW.per_lead_tier := 'gold';
  ELSIF NEW.active_domains_count >= 100 THEN
    NEW.per_lead_tier := 'silver';
  ELSE
    NEW.per_lead_tier := 'bronze';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;