import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prospectIds, autoUpdateStatus, filtersApplied, exportAllContacts = true } = await req.json();

    if (!prospectIds || prospectIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No prospects selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Exporting ${prospectIds.length} prospects for user ${user.id}`);

    // Fetch prospect data with report information
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select('id, report_id, assigned_to, lost_reason, lost_notes, icebreaker_text, icebreaker_generated_at, reports!inner(domain, slug, report_data, extracted_company_name)')
      .in('id', prospectIds);

    if (fetchError) {
      console.error('Error fetching prospects:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch prospect data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch contacts for all prospects
    const { data: allContacts, error: contactsError } = await supabase
      .from('prospect_contacts')
      .select('*')
      .in('prospect_activity_id', prospectIds)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
    }

    // Group contacts by prospect_activity_id
    const contactsByProspect = new Map();
    (allContacts || []).forEach((contact: any) => {
      if (!contactsByProspect.has(contact.prospect_activity_id)) {
        contactsByProspect.set(contact.prospect_activity_id, []);
      }
      contactsByProspect.get(contact.prospect_activity_id).push(contact);
    });

    // Fetch admin details for assignment mapping
    const { data: adminsData } = await supabase.functions.invoke('get-admins', {
      headers: { Authorization: authHeader }
    });
    
    const adminMap = new Map();
    if (adminsData?.admins) {
      adminsData.admins.forEach((admin: any) => {
        adminMap.set(admin.user_id, admin.email || admin.display_name || 'Unknown Admin');
      });
    }

    // Build CSV
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

    for (const prospect of prospects) {
      const reportData = prospect.reports.report_data as any;
      const domain = prospect.reports.domain;
      const companyName = prospect.reports.extracted_company_name || domain;
      const reportUrl = `https://x1.nurturely.io/report/${prospect.reports.slug}`;
      
      if (!domains.includes(domain)) {
        domains.push(domain);
      }

      const assignedAdmin = prospect.assigned_to 
        ? (adminMap.get(prospect.assigned_to) || 'Unknown Admin')
        : 'Unassigned';

      const icebreaker = escapeCsv(prospect.icebreaker_text || '');

      const prospectContacts = contactsByProspect.get(prospect.id) || [];
      
      // Filter contacts based on export option
      const contactsToExport = exportAllContacts 
        ? prospectContacts 
        : prospectContacts.filter((c: any) => c.is_primary).slice(0, 1);

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
        // Create a row for each contact
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

    // Log export to database
    const { error: logError } = await supabase
      .from('prospect_exports')
      .insert({
        exported_by: user.id,
        prospect_ids: prospectIds,
        domains: domains,
        export_count: prospectIds.length,
        filters_applied: filtersApplied || {},
        auto_updated_to_contacted: autoUpdateStatus || false,
      });

    if (logError) {
      console.error('Error logging export:', logError);
    }

    // Update status to "contacted" if requested
    if (autoUpdateStatus) {
      const { error: updateError } = await supabase
        .from('prospect_activities')
        .update({ status: 'contacted' })
        .in('id', prospectIds);

      if (updateError) {
        console.error('Error updating prospect status:', updateError);
        return new Response(JSON.stringify({ error: 'Export succeeded but status update failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Updated ${prospectIds.length} prospects to "contacted" status`);
    }

    // Return CSV file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `prospects_export_${timestamp}.csv`;

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in export-prospects function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
