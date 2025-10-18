-- Create enums for client management system
CREATE TYPE public.client_status AS ENUM ('onboarding', 'active', 'at_risk', 'churned', 'paused');
CREATE TYPE public.implementation_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_client', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create client_accounts table
CREATE TABLE public.client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_activity_id UUID NOT NULL REFERENCES public.prospect_activities(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  status public.client_status NOT NULL DEFAULT 'onboarding',
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  contract_value NUMERIC,
  contract_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_renewal_date TIMESTAMP WITH TIME ZONE,
  assigned_csm UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(prospect_activity_id)
);

-- Create client_implementation table
CREATE TABLE public.client_implementation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  tracking_code_installed BOOLEAN NOT NULL DEFAULT FALSE,
  tracking_code_verified_at TIMESTAMP WITH TIME ZONE,
  data_flowing BOOLEAN NOT NULL DEFAULT FALSE,
  first_data_received_at TIMESTAMP WITH TIME ZONE,
  integration_notes TEXT,
  implementation_status public.implementation_status NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(client_account_id)
);

-- Create client_outreach_performance table
CREATE TABLE public.client_outreach_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_identified INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  conversion_rate NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create support_ticket_messages table
CREATE TABLE public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create auto-transfer function
CREATE OR REPLACE FUNCTION public.auto_create_client_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_name TEXT;
  v_domain TEXT;
  v_client_id UUID;
BEGIN
  -- Only trigger when status changes TO closed_won
  IF NEW.status = 'closed_won' AND (OLD.status IS NULL OR OLD.status != 'closed_won') THEN
    
    -- Get company name and domain from reports table
    SELECT r.extracted_company_name, r.domain
    INTO v_company_name, v_domain
    FROM reports r
    WHERE r.id = NEW.report_id;
    
    -- Check if client account already exists (prevent duplicates)
    IF NOT EXISTS (
      SELECT 1 FROM client_accounts WHERE prospect_activity_id = NEW.id
    ) THEN
      
      -- Create client account
      INSERT INTO client_accounts (
        prospect_activity_id,
        report_id,
        company_name,
        domain,
        status,
        health_score,
        contract_start_date,
        assigned_csm
      ) VALUES (
        NEW.id,
        NEW.report_id,
        COALESCE(v_company_name, v_domain),
        v_domain,
        'onboarding',
        100,
        NOW(),
        NEW.assigned_to
      )
      RETURNING id INTO v_client_id;
      
      -- Create initial implementation record
      INSERT INTO client_implementation (
        client_account_id,
        implementation_status
      ) VALUES (
        v_client_id,
        'not_started'
      );
      
      -- Log to audit trail
      INSERT INTO audit_logs (
        table_name,
        record_id,
        action_type,
        field_name,
        old_value,
        new_value,
        business_context,
        changed_by
      ) VALUES (
        'client_accounts',
        v_client_id,
        'INSERT',
        'status',
        NULL,
        'onboarding',
        'Auto-created client account from closed_won prospect: ' || v_domain,
        auth.uid()
      );
      
      RAISE NOTICE 'Created client account for domain: %', v_domain;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on prospect_activities
CREATE TRIGGER trigger_auto_create_client_account
  AFTER UPDATE OF status ON public.prospect_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_client_account();

-- Enable RLS on all new tables
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_implementation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_outreach_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_accounts
CREATE POLICY "Admins can view all client accounts"
  ON public.client_accounts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert client accounts"
  ON public.client_accounts FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update client accounts"
  ON public.client_accounts FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete client accounts"
  ON public.client_accounts FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies for client_implementation
CREATE POLICY "Admins can view all implementations"
  ON public.client_implementation FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert implementations"
  ON public.client_implementation FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update implementations"
  ON public.client_implementation FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for client_outreach_performance
CREATE POLICY "Admins can view all outreach performance"
  ON public.client_outreach_performance FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert outreach performance"
  ON public.client_outreach_performance FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update outreach performance"
  ON public.client_outreach_performance FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for support_tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (is_admin(auth.uid()));

-- RLS Policies for support_ticket_messages
CREATE POLICY "Admins can view all ticket messages"
  ON public.support_ticket_messages FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert ticket messages"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_client_accounts_status ON public.client_accounts(status);
CREATE INDEX idx_client_accounts_assigned_csm ON public.client_accounts(assigned_csm);
CREATE INDEX idx_client_accounts_prospect_id ON public.client_accounts(prospect_activity_id);
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets(client_account_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- Add updated_at triggers
CREATE TRIGGER update_client_accounts_updated_at
  BEFORE UPDATE ON public.client_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_implementation_updated_at
  BEFORE UPDATE ON public.client_implementation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();