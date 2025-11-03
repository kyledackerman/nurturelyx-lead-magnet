-- Create subscriber_profiles table
CREATE TABLE public.subscriber_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credit_balance INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_platform_fee NUMERIC NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create credit_purchases table
CREATE TABLE public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_purchased INTEGER NOT NULL,
  amount_paid NUMERIC NOT NULL,
  stripe_payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriber_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriber_profiles
CREATE POLICY "Users can view own profile"
  ON public.subscriber_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.subscriber_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert profiles"
  ON public.subscriber_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update profiles"
  ON public.subscriber_profiles
  FOR UPDATE
  USING (true);

-- RLS Policies for credit_purchases
CREATE POLICY "Users can view own purchases"
  ON public.credit_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.credit_purchases
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert purchases"
  ON public.credit_purchases
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at on subscriber_profiles
CREATE TRIGGER update_subscriber_profiles_updated_at
  BEFORE UPDATE ON public.subscriber_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_subscriber_profiles_user_id ON public.subscriber_profiles(user_id);
CREATE INDEX idx_subscriber_profiles_stripe_customer_id ON public.subscriber_profiles(stripe_customer_id);
CREATE INDEX idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX idx_credit_purchases_created_at ON public.credit_purchases(created_at DESC);