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

    const { prospectIds, autoUpdateStatus, filtersApplied } = await req.json();

    if (!prospectIds || prospectIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No prospects selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Exporting ${prospectIds.length} prospects for user ${user.id}`);

    // Fetch prospect data with report information and contacts
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select('id, report_id, assigned_to, lost_reason, lost_notes, reports!inner(domain, slug, report_data)')
      .in('id', prospectIds);

    if (fetchError) {
      console.error('Error fetching prospects:', fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch prospect data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all contacts for these prospects
    const { data: allContacts, error: contactsError } = await supabase
      .from('prospect_contacts')
      .select('*')
      .in('prospect_activity_id', prospectIds)
      .order('is_decision_maker', { ascending: false })
      .order('confidence_score', { ascending: false });

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
    }

    // Group contacts by prospect
    const contactsByProspect = new Map();
    if (allContacts) {
      allContacts.forEach(contact => {
        if (!contactsByProspect.has(contact.prospect_activity_id)) {
          contactsByProspect.set(contact.prospect_activity_id, []);
        }
        contactsByProspect.get(contact.prospect_activity_id).push(contact);
      });
    }

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

    // Build CSV with new contact columns
    const csvRows: string[] = [];
    csvRows.push('Domain,Contact Type,First Name,Last Name,Email,Job Title,Phone,Street Address,Facebook URL,LinkedIn URL,Monthly Traffic,Estimated Leads,Missed Sales,Monthly Revenue Loss,Report URL,Assigned To,Confidence Score,Source');

    const domains: string[] = [];

    for (const prospect of prospects) {
      const reportData = prospect.reports.report_data as any;
      const domain = prospect.reports.domain;
      const reportUrl = `https://x1.nurturely.io/report/${prospect.reports.slug}`;
      domains.push(domain);

      const assignedAdmin = prospect.assigned_to 
        ? (adminMap.get(prospect.assigned_to) || 'Unknown Admin')
        : 'Unassigned';

      const contacts = contactsByProspect.get(prospect.id) || [];

      if (contacts.length === 0) {
        // No contacts found - export one row with prospect data only
        const row = [
          domain,
          'N/A', // Contact Type
          'N/A', // First Name
          'N/A', // Last Name
          'N/A', // Email
          'N/A', // Job Title
          'N/A', // Phone
          'N/A', // Street Address
          'N/A', // Facebook URL
          'N/A', // LinkedIn URL
          reportData.organicTraffic || '0',
          reportData.missedLeads || '0',
          reportData.estimatedSalesLost || '0',
          reportData.monthlyRevenueLost || '0',
          reportUrl,
          assignedAdmin,
          'N/A', // Confidence Score
          'N/A', // Source
        ];

        const escapedRow = row.map(value => {
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });

        csvRows.push(escapedRow.join(','));
      } else {
        // Export one row per contact (decision-makers first, then by confidence)
        for (const contact of contacts) {
          const row = [
            domain,
            contact.contact_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format: Decision Maker
            contact.first_name,
            contact.last_name || 'N/A',
            contact.email,
            contact.job_title || 'N/A',
            contact.phone || 'N/A',
            contact.street_address || 'N/A',
            contact.facebook_url || 'N/A',
            contact.linkedin_url || 'N/A',
            reportData.organicTraffic || '0',
            reportData.missedLeads || '0',
            reportData.estimatedSalesLost || '0',
            reportData.monthlyRevenueLost || '0',
            reportUrl,
            assignedAdmin,
            contact.confidence_score.toString(),
            contact.source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          ];

          const escapedRow = row.map(value => {
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          });

          csvRows.push(escapedRow.join(','));
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
