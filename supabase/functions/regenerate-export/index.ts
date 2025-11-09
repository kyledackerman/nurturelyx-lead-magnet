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
    const BATCH_SIZE = 50;
    let allProspects: any[] = [];
    let allContacts: any[] = [];

    for (let i = 0; i < prospectIds.length; i += BATCH_SIZE) {
      const batch = prospectIds.slice(i, i + BATCH_SIZE);

      const { data: prospects, error: prospectsError } = await supabase
        .from('prospect_activities')
        .select(`
          id,
          status,
          priority,
          lead_source,
          icebreaker_text,
          contact_count,
          assigned_to,
          created_at,
          updated_at,
          report_id,
          reports (
            domain,
            extracted_company_name,
            report_data,
            industry,
            city,
            state,
            facebook_url
          )
        `)
        .in('id', batch);

      if (prospectsError) {
        console.error('Error fetching prospects batch:', prospectsError);
        continue;
      }

      const { data: contacts, error: contactsError } = await supabase
        .from('prospect_contacts')
        .select('*')
        .in('prospect_activity_id', batch);

      if (contactsError) {
        console.error('Error fetching contacts batch:', contactsError);
      }

      allProspects = [...allProspects, ...(prospects || [])];
      allContacts = [...allContacts, ...(contacts || [])];
    }

    // Get admin details for assignment mapping
    const { data: adminData } = await supabase.rpc('get_admins');
    const adminMap = new Map(adminData?.map((a: any) => [a.id, { email: a.email, name: a.full_name }]) || []);

    // Generate CSV
    const csvRows: string[] = [];
    const headers = [
      'Domain',
      'Company Name',
      'Status',
      'Priority',
      'Lead Source',
      'Monthly Revenue Lost',
      'Missed Leads',
      'Organic Traffic',
      'Industry',
      'City',
      'State',
      'Facebook URL',
      'Icebreaker',
      'Contact Count',
      'Assigned To',
      'Created At',
      'Updated At',
      'Contact 1 First Name',
      'Contact 1 Last Name',
      'Contact 1 Email',
      'Contact 1 Phone',
      'Contact 1 Title',
      'Contact 1 LinkedIn',
      'Contact 2 First Name',
      'Contact 2 Last Name',
      'Contact 2 Email',
      'Contact 2 Phone',
      'Contact 2 Title',
      'Contact 2 LinkedIn',
      'Contact 3 First Name',
      'Contact 3 Last Name',
      'Contact 3 Email',
      'Contact 3 Phone',
      'Contact 3 Title',
      'Contact 3 LinkedIn'
    ];
    csvRows.push(headers.join(','));

    for (const prospect of allProspects) {
      const report = prospect.reports;
      const reportData = report?.report_data || {};
      const prospectContacts = allContacts.filter(c => c.prospect_activity_id === prospect.id);

      const assignedAdmin = prospect.assigned_to ? adminMap.get(prospect.assigned_to) : null;
      const assignedName = assignedAdmin ? `${assignedAdmin.name || assignedAdmin.email}` : '';

      const row = [
        report?.domain || '',
        report?.extracted_company_name || '',
        prospect.status || '',
        prospect.priority || '',
        prospect.lead_source || '',
        reportData.monthlyRevenueLost || 0,
        reportData.missedLeads || 0,
        reportData.organicTraffic || 0,
        report?.industry || '',
        report?.city || '',
        report?.state || '',
        report?.facebook_url || '',
        (prospect.icebreaker_text || '').replace(/"/g, '""'),
        prospect.contact_count || 0,
        assignedName,
        prospect.created_at || '',
        prospect.updated_at || '',
      ];

      for (let i = 0; i < 3; i++) {
        const contact = prospectContacts[i];
        if (contact) {
          row.push(
            contact.first_name || '',
            contact.last_name || '',
            contact.email || '',
            contact.phone || '',
            contact.title || '',
            contact.linkedin_url || ''
          );
        } else {
          row.push('', '', '', '', '', '');
        }
      }

      csvRows.push(row.map(field => `"${field}"`).join(','));
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
