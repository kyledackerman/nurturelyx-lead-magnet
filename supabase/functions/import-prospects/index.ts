import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  domain: string;
  avg_transaction_value: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; domain: string; error: string }>;
}

function parseCurrencyToNumber(value: string): number {
  // Remove currency symbols, commas, spaces, and other non-numeric chars except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  return numericValue ? parseFloat(numericValue) : 0;
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
    const requiredHeaders = ['domain', 'avg_transaction_value'];
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
      if (!row.domain || !row.avg_transaction_value) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          domain: row.domain || 'unknown',
          error: 'Missing required fields (domain, avg_transaction_value)',
        });
        continue;
      }

      // Validate transaction value is a positive number
      const transactionValue = parseCurrencyToNumber(row.avg_transaction_value);
      if (isNaN(transactionValue) || transactionValue <= 0) {
        result.failed++;
        result.errors.push({
          row: rowNum,
          domain: row.domain,
          error: 'Invalid avg_transaction_value: must be a positive number',
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

        // Create or update report
        if (report) {
          // Update existing report with transaction value
          const { error: updateError } = await supabaseClient
            .from('reports')
            .update({
              report_data: {
                avgTransactionValue: transactionValue,
                dataSource: 'manual'
              }
            })
            .eq('id', report.id);

          if (updateError) {
            throw new Error(`Failed to update report: ${updateError.message}`);
          }
        } else {
          // Create new report
          const { data: newReport, error: createError } = await supabaseClient
            .from('reports')
            .insert({
              domain: cleanDomain,
              report_data: {
                domain: cleanDomain,
                avgTransactionValue: transactionValue,
                dataSource: 'manual'
              },
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

        if (!existingActivity) {
          // Create prospect activity with 'new' status for enrichment
          const { error: activityError } = await supabaseClient
            .from('prospect_activities')
            .insert({
              report_id: report.id,
              status: 'new',
              activity_type: 'import',
              notes: `Imported for bulk processing - awaiting enrichment`,
              priority: 'cold',
              created_by: user.id,
              assigned_to: user.id,
              assigned_by: user.id,
              assigned_at: new Date().toISOString(),
            });

          if (activityError) {
            throw new Error(`Failed to create activity: ${activityError.message}`);
          }
        }

        result.success++;
        console.log(`Successfully imported domain: ${cleanDomain} with transaction value: ${transactionValue}`);

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
