-- Phase 1: Create all ambassador program tables

-- 1. Ambassador Applications Table
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  sales_experience TEXT,
  why_join TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassador_applications_status ON ambassador_applications(status);
CREATE INDEX idx_ambassador_applications_email ON ambassador_applications(email);

-- 2. Ambassador Profiles Table
CREATE TABLE IF NOT EXISTS ambassador_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  application_id UUID REFERENCES ambassador_applications(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  payment_method TEXT CHECK (payment_method IN ('paypal', 'venmo', 'bank_transfer', 'check')),
  payment_details JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
  
  -- Performance Metrics
  active_domains_count INTEGER NOT NULL DEFAULT 0,
  total_domains_purchased INTEGER NOT NULL DEFAULT 0,
  total_signups_lifetime INTEGER NOT NULL DEFAULT 0,
  total_leads_processed INTEGER NOT NULL DEFAULT 0,
  total_revenue_generated NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  
  -- Financial Metrics
  pending_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  eligible_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  lifetime_commission_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_spent_on_leads NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  
  -- Tier Calculations (auto-computed)
  platform_fee_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (platform_fee_tier IN ('bronze', 'silver', 'gold')),
  per_lead_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (per_lead_tier IN ('bronze', 'silver', 'gold')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassador_profiles_user_id ON ambassador_profiles(user_id);
CREATE INDEX idx_ambassador_profiles_status ON ambassador_profiles(status);
CREATE INDEX idx_ambassador_profiles_email ON ambassador_profiles(email);

-- 3. Lead Purchases Table
CREATE TABLE IF NOT EXISTS lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  prospect_activity_id UUID NOT NULL UNIQUE REFERENCES prospect_activities(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0.01,
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded')),
  source TEXT NOT NULL DEFAULT 'marketplace' CHECK (source IN ('marketplace', 'direct')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_purchases_ambassador_id ON lead_purchases(ambassador_id);
CREATE INDEX idx_lead_purchases_domain ON lead_purchases(domain);
CREATE INDEX idx_lead_purchases_purchased_at ON lead_purchases(purchased_at);

-- 4. Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  prospect_activity_id UUID NOT NULL REFERENCES prospect_activities(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  
  commission_type TEXT NOT NULL CHECK (commission_type IN ('platform_fee', 'per_lead')),
  base_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'eligible', 'paid', 'cancelled')),
  
  -- Per-lead specific fields
  leads_processed INTEGER,
  per_lead_price NUMERIC(10,2),
  billing_period_start DATE,
  billing_period_end DATE,
  
  -- Timing fields
  first_lead_delivered_at TIMESTAMP WITH TIME ZONE,
  eligible_for_payout_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payout_batch_id UUID,
  
  -- Tier snapshots
  platform_fee_tier_at_time TEXT,
  per_lead_tier_at_time TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commissions_ambassador_id ON commissions(ambassador_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_eligible_date ON commissions(eligible_for_payout_at);
CREATE INDEX idx_commissions_domain ON commissions(domain);

-- 5. Client Pricing Table
CREATE TABLE IF NOT EXISTS client_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_activity_id UUID NOT NULL UNIQUE REFERENCES prospect_activities(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL,
  domain TEXT NOT NULL,
  
  platform_fee_monthly NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  per_lead_price NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'churned', 'paused')),
  
  activation_date TIMESTAMP WITH TIME ZONE,
  first_lead_delivered_at TIMESTAMP WITH TIME ZONE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  churn_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_pricing_ambassador_id ON client_pricing(ambassador_id);
CREATE INDEX idx_client_pricing_domain ON client_pricing(domain);
CREATE INDEX idx_client_pricing_status ON client_pricing(status);

-- 6. Payout Batches Table
CREATE TABLE IF NOT EXISTS payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name TEXT NOT NULL,
  batch_number SERIAL,
  payout_period_start DATE NOT NULL,
  payout_period_end DATE NOT NULL,
  
  total_ambassadors INTEGER NOT NULL,
  total_commission_amount NUMERIC(10,2) NOT NULL,
  total_commissions_count INTEGER NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  
  processed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(payout_period_start, payout_period_end)
);

CREATE INDEX idx_payout_batches_status ON payout_batches(status);
CREATE INDEX idx_payout_batches_period ON payout_batches(payout_period_start, payout_period_end);

-- Add new columns to prospect_activities for ambassador tracking
ALTER TABLE prospect_activities 
ADD COLUMN IF NOT EXISTS purchased_by_ambassador UUID,
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_prospect_activities_ambassador ON prospect_activities(purchased_by_ambassador);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ambassador_applications_updated_at
  BEFORE UPDATE ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassador_profiles_updated_at
  BEFORE UPDATE ON ambassador_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_pricing_updated_at
  BEFORE UPDATE ON client_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update ambassador tiers
CREATE OR REPLACE FUNCTION update_ambassador_tiers()
RETURNS TRIGGER AS $$
BEGIN
  -- Update platform fee tier based on total_signups_lifetime
  IF NEW.total_signups_lifetime >= 1000 THEN
    NEW.platform_fee_tier := 'gold';
  ELSIF NEW.total_signups_lifetime >= 100 THEN
    NEW.platform_fee_tier := 'silver';
  ELSIF NEW.total_signups_lifetime >= 10 THEN
    NEW.platform_fee_tier := 'bronze';
  END IF;
  
  -- Update per-lead tier based on active_domains_count
  IF NEW.active_domains_count >= 1000 THEN
    NEW.per_lead_tier := 'gold';
  ELSIF NEW.active_domains_count >= 100 THEN
    NEW.per_lead_tier := 'silver';
  ELSIF NEW.active_domains_count >= 10 THEN
    NEW.per_lead_tier := 'bronze';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ambassador_tiers_trigger
  BEFORE INSERT OR UPDATE OF total_signups_lifetime, active_domains_count ON ambassador_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassador_tiers();

-- RLS Policies
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;

-- Ambassador Applications Policies
CREATE POLICY "Anyone can submit applications"
  ON ambassador_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
  ON ambassador_applications FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
  ON ambassador_applications FOR UPDATE
  USING (is_admin(auth.uid()));

-- Ambassador Profiles Policies
CREATE POLICY "Ambassadors can view own profile"
  ON ambassador_profiles FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Ambassadors can update own profile"
  ON ambassador_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON ambassador_profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert profiles"
  ON ambassador_profiles FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Lead Purchases Policies
CREATE POLICY "Ambassadors can view own purchases"
  ON lead_purchases FOR SELECT
  USING (ambassador_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "System can insert purchases"
  ON lead_purchases FOR INSERT
  WITH CHECK (ambassador_id = auth.uid());

-- Commissions Policies
CREATE POLICY "Ambassadors can view own commissions"
  ON commissions FOR SELECT
  USING (ambassador_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "System can insert commissions"
  ON commissions FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "System can update commissions"
  ON commissions FOR UPDATE
  USING (is_admin(auth.uid()));

-- Client Pricing Policies
CREATE POLICY "Ambassadors can view own client pricing"
  ON client_pricing FOR SELECT
  USING (ambassador_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Ambassadors can update own client pricing"
  ON client_pricing FOR UPDATE
  USING (ambassador_id = auth.uid());

CREATE POLICY "System can insert client pricing"
  ON client_pricing FOR INSERT
  WITH CHECK (ambassador_id = auth.uid() OR is_admin(auth.uid()));

-- Payout Batches Policies
CREATE POLICY "Admins can view all payout batches"
  ON payout_batches FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create payout batches"
  ON payout_batches FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update payout batches"
  ON payout_batches FOR UPDATE
  USING (is_admin(auth.uid()));