import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientAccount {
  id: string;
  prospect_activity_id: string;
  report_id: string;
  company_name: string;
  domain: string;
  status: 'onboarding' | 'active' | 'at_risk' | 'churned' | 'paused';
  health_score: number;
  contract_value: number | null;
  contract_start_date: string;
  next_renewal_date: string | null;
  assigned_csm: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientImplementation {
  id: string;
  client_account_id: string;
  tracking_code_installed: boolean;
  tracking_code_verified_at: string | null;
  data_flowing: boolean;
  first_data_received_at: string | null;
  integration_notes: string | null;
  implementation_status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  created_at: string;
  updated_at: string;
}

export const useClientAccounts = (statusFilter?: string | null) => {
  return useQuery({
    queryKey: ['client-accounts', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('client_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all' && statusFilter !== null) {
        query = query.eq('status', statusFilter as 'onboarding' | 'active' | 'at_risk' | 'churned' | 'paused');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ClientAccount[];
    },
  });
};

export const useClientAccount = (clientId: string | null) => {
  return useQuery({
    queryKey: ['client-account', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      const { data, error } = await supabase
        .from('client_accounts')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data as ClientAccount;
    },
    enabled: !!clientId,
  });
};

export const useClientImplementation = (clientId: string | null) => {
  return useQuery({
    queryKey: ['client-implementation', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      const { data, error } = await supabase
        .from('client_implementation')
        .select('*')
        .eq('client_account_id', clientId)
        .single();

      if (error) throw error;
      return data as ClientImplementation;
    },
    enabled: !!clientId,
  });
};

export const useClientSidebarCounts = () => {
  return useQuery({
    queryKey: ['client-sidebar-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_accounts')
        .select('status');

      if (error) throw error;

      const counts = {
        all: data.length,
        onboarding: data.filter(c => c.status === 'onboarding').length,
        active: data.filter(c => c.status === 'active').length,
        at_risk: data.filter(c => c.status === 'at_risk').length,
      };

      return counts;
    },
  });
};
