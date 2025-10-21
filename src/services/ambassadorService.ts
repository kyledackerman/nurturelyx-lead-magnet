import { supabase } from "@/integrations/supabase/client";

export const ambassadorService = {
  // Get dashboard stats
  async getDashboardStats() {
    const { data, error } = await supabase.functions.invoke('get-ambassador-dashboard-stats');
    if (error) throw error;
    return data;
  },

  // Purchase a lead from marketplace
  async purchaseLead(prospectActivityId: string) {
    const { data, error } = await supabase.functions.invoke('purchase-lead', {
      body: { prospect_activity_id: prospectActivityId }
    });
    if (error) throw error;
    return data;
  },

  // Submit a new domain
  async submitDomain(domain: string, industryHint?: string, estimatedTraffic?: number) {
    const { data, error } = await supabase.functions.invoke('submit-ambassador-domain', {
      body: { domain, industry_hint: industryHint, estimated_traffic: estimatedTraffic }
    });
    if (error) throw error;
    return data;
  },

  // Get ambassador's domains
  async getMyDomains() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        status,
        priority,
        created_at,
        lead_source,
        reports!inner(
          id,
          domain,
          extracted_company_name,
          report_data
        )
      `)
      .eq('purchased_by_ambassador', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get marketplace leads (unassigned)
  async getMarketplaceLeads(limit = 50) {
    const { data, error } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        status,
        priority,
        created_at,
        reports!inner(
          id,
          domain,
          slug,
          extracted_company_name,
          report_data,
          industry,
          city,
          state
        )
      `)
      .is('purchased_by_ambassador', null)
      .is('assigned_to', null)
      .eq('reports.is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get commissions
  async getMyCommissions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('ambassador_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get client pricing for a domain
  async getClientPricing(prospectActivityId: string) {
    const { data, error } = await supabase
      .from('client_pricing')
      .select('*')
      .eq('prospect_activity_id', prospectActivityId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update client pricing
  async updateClientPricing(prospectActivityId: string, platformFee: number, perLeadPrice: number) {
    const { data, error } = await supabase
      .from('client_pricing')
      .update({
        platform_fee_monthly: platformFee,
        per_lead_price: perLeadPrice,
      })
      .eq('prospect_activity_id', prospectActivityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update ambassador profile
  async updateProfile(updates: {
    full_name?: string;
    phone?: string;
    location?: string;
    payment_method?: string;
    payment_details?: any;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ambassador_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit application
  async submitApplication(application: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    sales_experience?: string;
    why_join: string;
  }) {
    const { data, error } = await supabase
      .from('ambassador_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
