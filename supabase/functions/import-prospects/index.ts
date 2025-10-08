import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  domain: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedin_url?: string;
  company_name?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; domain: string; error: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin access
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { csvData, fileName } = await req.json();
    console.log(`Processing import: ${fileName}`);

    // Parse CSV
    const rows = csvData.split('\n').map((line: string) => line.trim()).filter(Boolean);
    const headers = rows[0].split(',').map((h: string) => h.trim().toLowerCase());
    
    // Validate headers
    const requiredHeaders = ['domain', 'first_name', 'last_name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required columns: ${missingHeaders.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dataRows = rows.slice(1);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const rowNum = i + 2; // +2 because of header row and 0-indexing
      const values = dataRows[i].split(',').map((v: string) => v.trim());
      
      const row: Partial<CSVRow> = {};
      headers.forEach((header: string, index: number) => {
        row[header as keyof CSVRow] = values[index] || undefined;
      });

      // Validate required fields
      if (!row.domain || !row.first_name || !row.last_name) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          domain: row.domain || 'unknown',
          error: 'Missing required fields (domain, first_name, last_name)',
        });
        continue;
      }

      try {
        // Clean domain
        const cleanDomain = row.domain.toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0];

        // Check if report exists
        let { data: report, error: reportError } = await supabaseClient
          .from('reports')
          .select('id')
          .eq('domain', cleanDomain)
          .maybeSingle();

        // Create report if doesn't exist
        if (!report) {
          const { data: newReport, error: createError } = await supabaseClient
            .from('reports')
            .insert({
              domain: cleanDomain,
              extracted_company_name: row.company_name || null,
              report_data: {},
              is_public: false,
            })
            .select('id')
            .single();

          if (createError) {
            throw new Error(`Failed to create report: ${createError.message}`);
          }
          report = newReport;
        }

        // Check if prospect activity already exists
        const { data: existingActivity } = await supabaseClient
          .from('prospect_activities')
          .select('id')
          .eq('report_id', report.id)
          .maybeSingle();

        let activityId: string;

        if (existingActivity) {
          activityId = existingActivity.id;
        } else {
          // Create prospect activity with enriched status
          const { data: activity, error: activityError } = await supabaseClient
            .from('prospect_activities')
            .insert({
              report_id: report.id,
              status: 'enriched',
              activity_type: 'import',
              notes: `Imported from CSV: ${fileName}`,
              priority: 'cold',
              created_by: user.id,
              assigned_to: user.id,
              assigned_by: user.id,
              assigned_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (activityError) {
            throw new Error(`Failed to create activity: ${activityError.message}`);
          }
          activityId = activity.id;
        }

        // Create contact
        const { error: contactError } = await supabaseClient
          .from('prospect_contacts')
          .insert({
            prospect_activity_id: activityId,
            report_id: report.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email || null,
            phone: row.phone || null,
            title: row.title || null,
            linkedin_url: row.linkedin_url || null,
            is_primary: true,
            created_by: user.id,
          });

        if (contactError) {
          throw new Error(`Failed to create contact: ${contactError.message}`);
        }

        result.success++;
        console.log(`Successfully imported: ${cleanDomain}`);

      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          domain: row.domain,
          error: error.message,
        });
        console.error(`Error processing row ${rowNum}:`, error);
      }
    }

    // Log import to history
    await supabaseClient.from('prospect_imports').insert({
      imported_by: user.id,
      file_name: fileName,
      total_rows: dataRows.length,
      successful_rows: result.success,
      failed_rows: result.failed,
      error_log: result.errors.length > 0 ? result.errors : null,
    });

    console.log(`Import complete: ${result.success} succeeded, ${result.failed} failed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
