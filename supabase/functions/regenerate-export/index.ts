import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdminData, error: adminCheckError } = await supabase.rpc('is_admin', {
      user_uuid: user.id,
    });

    if (adminCheckError || !isAdminData) {
      console.error('Admin check failed:', adminCheckError);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { exportId } = await req.json();
    console.log('Regenerating export:', exportId);

    // Fetch the export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('prospect_exports')
      .select('prospect_ids, domains, export_count')
      .eq('id', exportId)
      .single();

    if (exportError || !exportRecord) {
      console.error('Export not found:', exportError);
      return new Response(JSON.stringify({ error: 'Export record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prospectIds = exportRecord.prospect_ids;
    console.log(`Regenerating export for ${prospectIds.length} prospects`);

    // Fetch prospects and contacts in batches to avoid URI Too Long errors
    const BATCH_SIZE = 75;
    let allProspects: any[] = [];
    let allContacts: any[] = [];

    for (let i = 0; i < prospectIds.length; i += BATCH_SIZE) {
      const batch = prospectIds.slice(i, i + BATCH_SIZE);

      const { data: prospects, error: prospectsError } = await supabase
        .from('prospect_activities')
        .select('id, report_id, assigned_to, icebreaker_text, reports!inner(domain, slug, report_data, extracted_company_name)')
        .in('id', batch);

      if (prospectsError) {
        console.error('Error fetching prospects batch:', prospectsError);
        continue;
      }

      const { data: contacts, error: contactsError } = await supabase
        .from('prospect_contacts')
        .select('*')
        .in('prospect_activity_id', batch)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (contactsError) {
        console.error('Error fetching contacts batch:', contactsError);
      }

      allProspects = [...allProspects, ...(prospects || [])];
      allContacts = [...allContacts, ...(contacts || [])];
    }

    // Group contacts by prospect_activity_id
    const contactsByProspect = new Map();
    (allContacts || []).forEach((contact: any) => {
      if (!contactsByProspect.has(contact.prospect_activity_id)) {
        contactsByProspect.set(contact.prospect_activity_id, []);
      }
      contactsByProspect.get(contact.prospect_activity_id).push(contact);
    });

    // Generate CSV - EXACT format as export-prospects
    const csvRows: string[] = [];
    csvRows.push('First Name,Company Name,Email,Domain,Icebreaker,Report URL,Monthly Traffic,Estimated Leads,Missed Sales,Monthly Revenue Loss');

    const domains: string[] = [];
    
    const escapeCsv = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    for (const prospect of allProspects) {
      const reportData = prospect.reports.report_data as any;
      const domain = prospect.reports.domain;
      const companyName = prospect.reports.extracted_company_name || domain;
      const reportUrl = `https://x1.nurturely.io/report/${prospect.reports.slug}`;
      
      if (!domains.includes(domain)) {
        domains.push(domain);
      }

      const icebreaker = escapeCsv(prospect.icebreaker_text || '');

      const prospectContacts = contactsByProspect.get(prospect.id) || [];
      
      // Always export ALL contacts for regeneration (matches original behavior)
      const contactsToExport = prospectContacts;

      // If no contacts, still create one row with prospect data
      if (contactsToExport.length === 0) {
        const row = [
          '', // No contact first name
          companyName,
          '', // No email
          domain,
          icebreaker,
          reportUrl,
          reportData.organicTraffic || '0',
          reportData.missedLeads || '0',
          reportData.estimatedSalesLost || '0',
          reportData.monthlyRevenueLost || '0',
        ];

        csvRows.push(row.join(','));
      } else {
        // Create a row for each contact (EXACT same logic as export-prospects)
        for (const contact of contactsToExport) {
          const row = [
            escapeCsv(contact.first_name || ''),
            escapeCsv(companyName),
            escapeCsv(contact.email || ''),
            escapeCsv(domain),
            icebreaker,
            escapeCsv(reportUrl),
            escapeCsv(reportData.organicTraffic || '0'),
            escapeCsv(reportData.missedLeads || '0'),
            escapeCsv(reportData.estimatedSalesLost || '0'),
            escapeCsv(reportData.monthlyRevenueLost || '0'),
          ];

          csvRows.push(row.join(','));
        }
      }
    }

    const csv = csvRows.join('\n');

    // Log regeneration to audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'prospect_exports',
      record_id: exportId,
      action_type: 'export_regenerated',
      business_context: `Regenerated export containing ${allProspects.length} prospects (${prospectIds.length - allProspects.length} no longer exist)`,
      changed_by: user.id
    });

    const warnMessage = prospectIds.length !== allProspects.length
      ? `\nNote: ${prospectIds.length - allProspects.length} prospects no longer exist in database`
      : '';

    console.log(`Export regenerated successfully. ${allProspects.length} of ${prospectIds.length} prospects found.${warnMessage}`);

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="prospects_export_regenerated_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error in regenerate-export:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
