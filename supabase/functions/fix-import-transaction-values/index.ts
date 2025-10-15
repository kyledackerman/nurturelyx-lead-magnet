import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonthlyRevenueData {
  month: string;
  year: number;
  visitors: number;
  organicVisitors: number;
  paidVisitors: number;
  leads: number;
  missedLeads: number;
  sales: number;
  lostSales: number;
  revenueLost: number;
  lostRevenue: number;
}

function calculateReportMetrics(
  organicTraffic: number,
  paidTraffic: number,
  avgTransactionValue: number,
  monthlyRevenueData: MonthlyRevenueData[]
) {
  const VISITOR_TO_LEAD_RATE = 0.02;
  const CONVERSION_RATE = 0.01;

  let totalMissedLeads = 0;
  let totalEstimatedSalesLost = 0;
  let totalMonthlyRevenueLost = 0;

  const updatedMonthlyData = monthlyRevenueData.map((month) => {
    const totalVisitors = month.organicVisitors + month.paidVisitors;
    const leads = Math.round(totalVisitors * VISITOR_TO_LEAD_RATE);
    const missedLeads = leads;
    const sales = Math.round(leads * CONVERSION_RATE);
    const lostSales = sales;
    const revenueLost = lostSales * avgTransactionValue;

    totalMissedLeads += missedLeads;
    totalEstimatedSalesLost += lostSales;
    totalMonthlyRevenueLost += revenueLost;

    return {
      ...month,
      leads,
      missedLeads,
      sales,
      lostSales,
      revenueLost,
      lostRevenue: revenueLost,
    };
  });

  const yearlyRevenueLost = totalMonthlyRevenueLost;

  return {
    missedLeads: totalMissedLeads,
    estimatedSalesLost: totalEstimatedSalesLost,
    monthlyRevenueLost: totalMonthlyRevenueLost / 12,
    yearlyRevenueLost,
    monthlyRevenueData: updatedMonthlyData,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jobId, multiplier = 1000 } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Fix Transaction Values] Starting fix for job ${jobId} with multiplier ${multiplier}`);

    // Step 1: Get the import job to find its timestamp
    const { data: importJob, error: jobError } = await supabase
      .from('import_jobs')
      .select('created_at, started_at, completed_at')
      .eq('id', jobId)
      .single();

    if (jobError || !importJob) {
      console.error('[Fix Transaction Values] Import job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Import job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Find reports created during this import's time window
    const jobStartTime = new Date(importJob.started_at || importJob.created_at);
    const jobEndTime = importJob.completed_at 
      ? new Date(importJob.completed_at)
      : new Date(jobStartTime.getTime() + 3600000); // +1 hour if not completed

    const timeWindowStart = new Date(jobStartTime.getTime() - 300000); // -5 min buffer
    const timeWindowEnd = new Date(jobEndTime.getTime() + 300000); // +5 min buffer

    console.log(`[Fix Transaction Values] Looking for reports between ${timeWindowStart.toISOString()} and ${timeWindowEnd.toISOString()}`);

    // Step 3: Query reports by creation time and lead_source
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, domain, report_data, created_at')
      .gte('created_at', timeWindowStart.toISOString())
      .lte('created_at', timeWindowEnd.toISOString())
      .eq('lead_source', 'import');

    if (reportsError) {
      console.error('[Fix Transaction Values] Error fetching reports:', reportsError);
      throw reportsError;
    }

    if (!reports || reports.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No reports found for this import job time window', fixed: 0 }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Fix Transaction Values] Found ${reports.length} reports to fix`);

    let fixedCount = 0;
    const errors = [];

    for (const report of reports) {
      try {
        const reportData = report.report_data as any;
        const oldAvgTransactionValue = reportData.avgTransactionValue || 0;
        const newAvgTransactionValue = oldAvgTransactionValue * multiplier;

        console.log(`[Fix Transaction Values] ${report.domain}: ${oldAvgTransactionValue} -> ${newAvgTransactionValue}`);

        // Recalculate all metrics with new transaction value
        const recalculated = calculateReportMetrics(
          reportData.organicTraffic || 0,
          reportData.paidTraffic || 0,
          newAvgTransactionValue,
          reportData.monthlyRevenueData || []
        );

        // Update report data
        const updatedReportData = {
          ...reportData,
          avgTransactionValue: newAvgTransactionValue,
          missedLeads: recalculated.missedLeads,
          estimatedSalesLost: recalculated.estimatedSalesLost,
          monthlyRevenueLost: recalculated.monthlyRevenueLost,
          yearlyRevenueLost: recalculated.yearlyRevenueLost,
          monthlyRevenueData: recalculated.monthlyRevenueData,
        };

        // Update the report in database
        const { error: updateError } = await supabase
          .from('reports')
          .update({ report_data: updatedReportData })
          .eq('id', report.id);

        if (updateError) {
          console.error(`[Fix Transaction Values] Error updating ${report.domain}:`, updateError);
          errors.push({ domain: report.domain, error: updateError.message });
        } else {
          fixedCount++;
        }
      } catch (err) {
        console.error(`[Fix Transaction Values] Error processing ${report.domain}:`, err);
        errors.push({ domain: report.domain, error: err.message });
      }
    }

    console.log(`[Fix Transaction Values] Fixed ${fixedCount}/${reports.length} reports`);

    return new Response(
      JSON.stringify({
        success: true,
        fixed: fixedCount,
        total: reports.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Fix Transaction Values] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
