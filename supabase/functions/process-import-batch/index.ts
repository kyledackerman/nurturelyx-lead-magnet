import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPYFU_API_USERNAME = "bd5d70b5-7793-4c6e-b012-2a62616bf1af";
const SPYFU_API_KEY = "VESAPD8P";
const BATCH_SIZE = 10; // Reduced from 50 to prevent timeouts
const FUNCTION_TIMEOUT_MS = 90000; // 90 seconds safety margin (function timeout ~120s)

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

interface ApiData {
  organicTraffic: number;
  organicKeywords: number;
  domainPower: number;
  backlinks: number;
  paidTraffic: number;
  dataSource: "api" | "manual";
  monthlyRevenueData: MonthlyRevenueData[];
}

function parseCurrencyToNumber(value: string): number {
  const numericValue = value.replace(/[^0-9.]/g, '');
  return numericValue ? parseFloat(numericValue) : 0;
}

function cleanDomain(domain: string): string {
  return domain
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();
}

function extractCompanyName(domain: string): string {
  const cleaned = cleanDomain(domain).replace(/\.(com|net|org|io|co|us|ca|uk).*$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function detectIndustry(domain: string): string {
  const lowerDomain = domain.toLowerCase();
  const industries: Record<string, string[]> = {
    'hvac': ['hvac', 'heating', 'cooling', 'air-conditioning', 'furnace', 'ac-repair'],
    'plumbing': ['plumbing', 'plumber', 'pipe', 'drain', 'sewer', 'water-heater'],
    'roofing': ['roofing', 'roof', 'gutter', 'shingle'],
    'electrical': ['electric', 'electrical', 'electrician', 'wiring'],
    'automotive': ['auto', 'car', 'vehicle', 'automotive', 'mechanic', 'repair-shop'],
    'legal': ['law', 'legal', 'attorney', 'lawyer', 'firm'],
    'medical': ['medical', 'health', 'doctor', 'clinic', 'dental', 'dentist'],
    'real-estate': ['real-estate', 'realtor', 'realty', 'property', 'homes'],
  };
  
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => lowerDomain.includes(keyword))) {
      return industry;
    }
  }
  return 'other';
}

function calculateTrafficTier(organicTraffic: number): string {
  if (organicTraffic >= 10000) return 'enterprise';
  if (organicTraffic >= 5000) return 'high';
  if (organicTraffic >= 1000) return 'medium';
  return 'low';
}

function calculateCompanySize(organicTraffic: number, yearlyRevenueLost: number): string {
  if (organicTraffic >= 10000 || yearlyRevenueLost >= 100000) return 'large';
  if (organicTraffic >= 1000 || yearlyRevenueLost >= 25000) return 'medium';
  return 'small';
}

async function fetchSpyFuData(domain: string): Promise<ApiData> {
  const spyfuUrl = `https://www.spyfu.com/apis/domain_stats_api/v2/getAllDomainStats?domain=${encodeURIComponent(domain)}&countryCode=US&api_username=${encodeURIComponent(SPYFU_API_USERNAME)}&api_key=${encodeURIComponent(SPYFU_API_KEY)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(spyfuUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`SpyFu API returned status ${response.status}`);
    }

    const raw: any = await response.json();
    const rawRows: any[] = Array.isArray(raw)
      ? raw
      : (raw?.data || raw?.domainStats || raw?.stats || raw?.results || raw?.rows || []);

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      throw new Error("SpyFu returned no data");
    }

    const monthMap: Record<string, number> = {
      jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
      apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
      aug: 8, august: 8, sep: 9, sept: 9, september: 9,
      oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
    };

    const toMonthNumber = (m: any): number => {
      if (typeof m === "number" && m >= 1 && m <= 12) return m;
      if (typeof m === "string") {
        const key = m.trim().toLowerCase();
        if (monthMap[key] != null) return monthMap[key];
        const parsed = parseInt(key, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) return parsed;
      }
      return 0;
    };

    const monthly = rawRows.map((r: any) => {
      const monthNum = toMonthNumber(r.month ?? r.Month ?? r.searchMonth ?? r.searchMonthNumber);
      const year = r.searchYear ?? r.Year ?? r.year ?? new Date().getFullYear();
      const organic = r.monthlyOrganicClicks ?? r.organicClicks ?? r.organic ?? 0;
      const paid = r.monthlyPaidClicks ?? r.paidClicks ?? r.paid ?? 0;
      const totalOrganicResults = r.totalOrganicResults ?? r.organicKeywords ?? r.keywords ?? 0;
      const strength = r.strength ?? r.domainStrength ?? r.domainPower ?? 0;

      return {
        month: monthNum,
        searchYear: year,
        monthlyOrganicClicks: Math.max(0, Math.floor(organic)),
        monthlyPaidClicks: Math.max(0, Math.floor(paid)),
        totalOrganicResults: Math.max(0, Math.floor(totalOrganicResults)),
        strength: Math.max(0, Math.floor(strength)),
      };
    }).filter((m: any) => m.month >= 1 && m.month <= 12);

    if (!monthly.length) {
      throw new Error("No valid monthly data");
    }

    const referenceMonth = [...monthly].reverse().find(m => m.monthlyOrganicClicks > 0 || m.monthlyPaidClicks > 0) || monthly[monthly.length - 1];

    return {
      organicTraffic: referenceMonth.monthlyOrganicClicks,
      paidTraffic: referenceMonth.monthlyPaidClicks,
      organicKeywords: referenceMonth.totalOrganicResults,
      domainPower: referenceMonth.strength,
      backlinks: 0,
      dataSource: "api",
      monthlyRevenueData: monthly.map(m => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month: monthNames[m.month - 1],
          year: m.searchYear,
          visitors: m.monthlyOrganicClicks + m.monthlyPaidClicks,
          organicVisitors: m.monthlyOrganicClicks,
          paidVisitors: m.monthlyPaidClicks,
          leads: 0,
          missedLeads: 0,
          sales: 0,
          lostSales: 0,
          revenueLost: 0,
          lostRevenue: 0,
        };
      }),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function calculateReportMetrics(apiData: ApiData, avgTransactionValue: number) {
  const visitorIdentificationRate = 0.2;
  const salesConversionRate = 0.01;

  // Handle empty monthlyRevenueData
  if (!apiData.monthlyRevenueData || apiData.monthlyRevenueData.length === 0) {
    return {
      missedLeads: 0,
      estimatedSalesLost: 0,
      monthlyRevenueLost: 0,
      yearlyRevenueLost: 0,
      monthlyRevenueData: []
    };
  }

  const monthlyRevenueData = apiData.monthlyRevenueData.map(row => {
    const totalVisitors = row.visitors;
    const leads = Math.floor(totalVisitors * visitorIdentificationRate);
    const sales = Math.floor(leads * salesConversionRate);
    const revenue = sales * avgTransactionValue;

    return {
      ...row,
      leads,
      missedLeads: leads,
      sales,
      lostSales: sales,
      revenueLost: revenue,
      lostRevenue: revenue,
    };
  });

  const referenceMonth = [...monthlyRevenueData].reverse().find(m => m.visitors > 0) || monthlyRevenueData[monthlyRevenueData.length - 1];
  const missedLeads = referenceMonth.missedLeads;
  const estimatedSalesLost = referenceMonth.lostSales;
  const monthlyRevenueLost = referenceMonth.revenueLost;
  const yearlyRevenueLost = monthlyRevenueLost * 12;

  return {
    missedLeads,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
    monthlyRevenueData,
  };
}

Deno.serve(async (req) => {
  console.log(`[STARTUP] process-import-batch invoked at ${new Date().toISOString()}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[STARTUP] Initializing Supabase client...`);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { jobId } = await req.json();
    console.log(`[STARTUP] Processing batch for job ${jobId} at ${new Date().toISOString()}`);

    // Fetch job
    console.log(`[DB] Fetching job ${jobId}...`);
    const { data: job, error: jobError } = await supabaseClient
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    console.log(`[DB] Job fetched. Status: ${job?.status}, Processed: ${job?.processed_rows}/${job?.total_rows}`);

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      console.log(`Job ${jobId} already ${job.status}`);
      return new Response(
        JSON.stringify({ status: job.status }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update to processing with heartbeat
    await supabaseClient
      .from('import_jobs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Parse CSV
    const rows = job.csv_data.split('\n').map((line: string) => line.trim()).filter(Boolean);
    const headers = rows[0].split(',').map((h: string) => h.trim().toLowerCase());
    const dataRows = rows.slice(1);

    const startIdx = job.processed_rows;
    const endIdx = Math.min(startIdx + BATCH_SIZE, dataRows.length);
    const errorLog = Array.isArray(job.error_log) ? job.error_log : [];
    let successCount = 0;
    let failCount = 0;
    const processingStartTime = Date.now();

    console.log(`[BATCH] Processing batch: rows ${startIdx} to ${endIdx - 1} (total: ${dataRows.length})`);

    // Process batch with timeout protection
    for (let i = startIdx; i < endIdx; i++) {
      // Check timeout protection - exit gracefully if approaching function timeout
      const elapsedTime = Date.now() - processingStartTime;
      if (elapsedTime > FUNCTION_TIMEOUT_MS) {
        console.warn(`[TIMEOUT] Approaching function timeout after ${elapsedTime}ms. Gracefully exiting at row ${i}.`);
        
        // Update job with current progress
        await supabaseClient
          .from('import_jobs')
          .update({
            successful_rows: job.successful_rows + successCount,
            failed_rows: job.failed_rows + failCount,
            error_log: [...errorLog, {
              timestamp: new Date().toISOString(),
              row: 'system',
              domain: 'system',
              error: `Batch paused at row ${i} due to approaching timeout. Will resume in next batch.`
            }],
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);
        
        // Schedule next batch
        console.log(`[TIMEOUT] Scheduling next batch from row ${i}...`);
        try {
          await supabaseClient.functions.invoke('process-import-batch', {
            body: { jobId }
          });
          console.log(`[TIMEOUT] Next batch scheduled successfully`);
        } catch (scheduleError) {
          console.error(`[TIMEOUT] Failed to schedule next batch:`, scheduleError);
        }
        
        return new Response(
          JSON.stringify({ status: 'timeout_graceful_exit', processed: i }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Check if job was cancelled before processing each row
      const { data: currentJob } = await supabaseClient
        .from('import_jobs')
        .select('status')
        .eq('id', jobId)
        .single();
      
      if (currentJob?.status === 'cancelled') {
        console.log(`Job ${jobId} was cancelled, stopping processing`);
        return new Response(
          JSON.stringify({ status: 'cancelled' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rowNum = i + 2;
      const values = dataRows[i].split(',').map((v: string) => v.trim());
      
      const row: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        row[header] = values[index] || '';
      });

      const domain = row.domain;
      const avgTransactionValue = parseCurrencyToNumber(row.avg_transaction_value);

      // Validate required fields
      if (!domain || !avgTransactionValue) {
        console.warn(`[ROW ${rowNum}] Missing required fields: domain=${!!domain}, avgTxValue=${!!avgTransactionValue}`);
        failCount++;
        errorLog.push({ 
          timestamp: new Date().toISOString(),
          row: rowNum, 
          domain: domain || 'unknown', 
          error: 'Missing required fields (domain or avg_transaction_value)' 
        });
        
        // Immediately update progress even for failures
        await supabaseClient
          .from('import_jobs')
          .update({
            processed_rows: i + 1,
            failed_rows: job.failed_rows + failCount,
            error_log: errorLog,
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);
        continue;
      }

      // Wrap each row in try/catch to skip individual failures
      try {
        const cleanedDomain = cleanDomain(domain);
        console.log(`Processing ${i + 1}/${dataRows.length}: ${cleanedDomain}`);

        let apiData: ApiData;
        try {
          apiData = await fetchSpyFuData(cleanedDomain);
        } catch (spyfuError) {
          console.warn(`SpyFu failed for ${cleanedDomain}:`, spyfuError.message);
          apiData = {
            organicTraffic: 0,
            paidTraffic: 0,
            organicKeywords: 0,
            domainPower: 0,
            backlinks: 0,
            dataSource: "manual",
            monthlyRevenueData: [],
          };
        }

        const metrics = calculateReportMetrics(apiData, avgTransactionValue);
        const companyName = extractCompanyName(cleanedDomain);
        const industry = detectIndustry(cleanedDomain);
        const trafficTier = calculateTrafficTier(apiData.organicTraffic);
        const companySize = calculateCompanySize(apiData.organicTraffic, metrics.yearlyRevenueLost);

        let { data: report } = await supabaseClient
          .from('reports')
          .select('id')
          .eq('domain', cleanedDomain)
          .maybeSingle();

        if (report) {
          await supabaseClient
            .from('reports')
            .update({
              report_data: {
                domain: cleanedDomain,
                avgTransactionValue: avgTransactionValue,
                organicTraffic: apiData.organicTraffic,
                paidTraffic: apiData.paidTraffic,
                organicKeywords: apiData.organicKeywords,
                domainPower: apiData.domainPower,
                backlinks: apiData.backlinks,
                dataSource: apiData.dataSource,
                missedLeads: metrics.missedLeads,
                estimatedSalesLost: metrics.estimatedSalesLost,
                monthlyRevenueLost: metrics.monthlyRevenueLost,
                yearlyRevenueLost: metrics.yearlyRevenueLost,
                monthlyRevenueData: metrics.monthlyRevenueData,
              },
              extracted_company_name: companyName,
              industry,
              monthly_traffic_tier: trafficTier,
              company_size: companySize,
            })
            .eq('id', report.id);
        } else {
          const { data: slugData } = await supabaseClient.rpc(
            'generate_report_slug',
            { domain_name: cleanedDomain }
          );

          const { data: newReport } = await supabaseClient
            .from('reports')
            .insert({
              domain: cleanedDomain,
              slug: slugData,
              user_id: job.created_by,
              import_source: 'csv_bulk_import',
              lead_source: 'csv_import',
              report_data: {
                domain: cleanedDomain,
                avgTransactionValue: avgTransactionValue,
                organicTraffic: apiData.organicTraffic,
                paidTraffic: apiData.paidTraffic,
                organicKeywords: apiData.organicKeywords,
                domainPower: apiData.domainPower,
                backlinks: apiData.backlinks,
                dataSource: apiData.dataSource,
                missedLeads: metrics.missedLeads,
                estimatedSalesLost: metrics.estimatedSalesLost,
                monthlyRevenueLost: metrics.monthlyRevenueLost,
                yearlyRevenueLost: metrics.yearlyRevenueLost,
                monthlyRevenueData: metrics.monthlyRevenueData,
              },
              extracted_company_name: companyName,
              industry,
              monthly_traffic_tier: trafficTier,
              company_size: companySize,
              is_public: false,
            })
            .select('id')
            .single();

          report = newReport;
        }

        const { data: existingActivity } = await supabaseClient
          .from('prospect_activities')
          .select('id')
          .eq('report_id', report!.id)
          .maybeSingle();

        if (!existingActivity) {
          await supabaseClient
            .from('prospect_activities')
            .insert({
              report_id: report!.id,
              status: 'new',
              activity_type: 'note',
              notes: 'Bulk imported - awaiting AI enrichment',
              priority: 'cold',
              lead_source: 'import',
              created_by: job.created_by,
              assigned_to: job.created_by,
              assigned_by: job.created_by,
              assigned_at: new Date().toISOString(),
            });
        }

        successCount++;
        console.log(`[ROW ${rowNum}] ✓ Success: ${cleanedDomain} (${successCount}/${i - startIdx + 1})`);
        
        // Immediately checkpoint progress after each successful row
        await supabaseClient
          .from('import_jobs')
          .update({
            processed_rows: i + 1,
            successful_rows: job.successful_rows + successCount,
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        // Small delay to avoid overwhelming SpyFu API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        failCount++;
        const errorMsg = error?.message || 'Unknown error';
        console.error(`[ROW ${rowNum}] ✗ Error processing ${domain}:`, errorMsg);
        
        errorLog.push({ 
          timestamp: new Date().toISOString(),
          row: rowNum, 
          domain, 
          error: errorMsg 
        });
        
        // Checkpoint progress even for failures - don't lose progress!
        await supabaseClient
          .from('import_jobs')
          .update({
            processed_rows: i + 1,
            failed_rows: job.failed_rows + failCount,
            error_log: errorLog,
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);
          
        // Continue processing next row instead of halting
      }
    }

    // Final batch summary (counts already updated per-row)
    console.log(`[BATCH] Batch complete: ${successCount} succeeded, ${failCount} failed`);

    // Check if complete
    const { data: updatedJob } = await supabaseClient
      .from('import_jobs')
      .select('processed_rows, total_rows')
      .eq('id', jobId)
      .single();

    if (updatedJob && updatedJob.processed_rows >= updatedJob.total_rows) {
      await supabaseClient
        .from('import_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      console.log(`Job ${jobId} completed`);
    } else {
      // Schedule next batch
      try {
        await supabaseClient.functions.invoke('process-import-batch', {
          body: { jobId }
        });
      } catch (err) {
        console.error('Failed to schedule next batch:', err);
        await supabaseClient
          .from('import_jobs')
          .update({
            status: 'failed',
            error_log: [...errorLog, { row: 'system', domain: 'system', error: `Failed to schedule next batch: ${err.message}` }]
          })
          .eq('id', jobId);
      }
    }

    return new Response(
      JSON.stringify({ status: 'processing' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
