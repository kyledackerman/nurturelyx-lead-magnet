-- Add credit_balance to ambassador_profiles
ALTER TABLE public.ambassador_profiles 
ADD COLUMN credit_balance numeric NOT NULL DEFAULT 0.00;

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('charge', 'settlement')),
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text NOT NULL,
  related_purchase_id uuid,
  related_commission_id uuid,
  related_payout_batch_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add payment_method to lead_purchases
ALTER TABLE public.lead_purchases
ADD COLUMN payment_method text NOT NULL DEFAULT 'credit';

-- Update payment_status to reflect credit status
COMMENT ON COLUMN public.lead_purchases.payment_status IS 'pending_settlement, settled, or completed';

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_transactions
CREATE POLICY "Ambassadors can view own credit transactions"
ON public.credit_transactions FOR SELECT
USING (ambassador_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "System can insert credit transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "System can update credit transactions"
ON public.credit_transactions FOR UPDATE
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_credit_transactions_ambassador_created 
ON public.credit_transactions(ambassador_id, created_at DESC);

CREATE INDEX idx_ambassador_profiles_credit_balance 
ON public.ambassador_profiles(credit_balance);

-- Add comment for documentation
COMMENT ON TABLE public.credit_transactions IS 'Tracks all credit balance changes for ambassadors - charges from lead purchases and settlements from commission payouts';
COMMENT ON COLUMN public.ambassador_profiles.credit_balance IS 'Outstanding credit balance that will be settled against commission payouts';