import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SpyFu API credentials (hardcoded from .env)
const SPYFU_API_USERNAME = "bd5d70b5-7793-4c6e-b012-2a62616bf1af";
const SPYFU_API_KEY = "VESAPD8P";

interface CSVRow {
  domain: string;
  avg_transaction_value: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; domain: string; error: string }>;
}

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

    // Find reference month (most recent with traffic)
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
  const visitorIdentificationRate = 0.2; // 20%
  const salesConversionRate = 0.01; // 1%

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

  // Use reference month for headline metrics
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

    // Find Kyle's user ID for assignment
    const { data: kyleUser } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')
      .limit(1)
      .single();
    
    const kyleUserId = kyleUser?.user_id || user.id; // Fallback to current user if Kyle not found

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
        const cleanedDomain = cleanDomain(row.domain);
        console.log(`Processing domain ${i + 1}/${dataRows.length}: ${cleanedDomain}`);

        // Fetch SpyFu data
        let apiData: ApiData;
        try {
          apiData = await fetchSpyFuData(cleanedDomain);
          console.log(`SpyFu data fetched for ${cleanedDomain}: ${apiData.organicTraffic} organic, ${apiData.paidTraffic} paid`);
        } catch (spyfuError) {
          console.warn(`SpyFu fetch failed for ${cleanedDomain}:`, spyfuError.message);
          // Use minimal fallback data
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

        // Calculate report metrics
        const metrics = calculateReportMetrics(apiData, transactionValue);

        // Auto-categorize
        const companyName = extractCompanyName(cleanedDomain);
        const industry = detectIndustry(cleanedDomain);
        const trafficTier = calculateTrafficTier(apiData.organicTraffic);
        const companySize = calculateCompanySize(apiData.organicTraffic, metrics.yearlyRevenueLost);

        // Check if report exists
        let { data: report } = await supabaseClient
          .from('reports')
          .select('id')
          .eq('domain', cleanedDomain)
          .maybeSingle();

        // Create or update report with full data
        if (report) {
          // Update existing report
          const { error: updateError } = await supabaseClient
            .from('reports')
            .update({
              report_data: {
                domain: cleanedDomain,
                avgTransactionValue: transactionValue,
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

          if (updateError) {
            throw new Error(`Failed to update report: ${updateError.message}`);
          }
          console.log(`Updated existing report for ${cleanedDomain}`);
        } else {
          // Generate slug for new report
          const { data: slugData, error: slugError } = await supabaseClient.rpc(
            'generate_report_slug',
            { domain_name: cleanedDomain }
          );

          if (slugError) {
            throw new Error(`Failed to generate slug: ${slugError.message}`);
          }

          // Create new report with full data (user_id = null for admin imports)
          const { data: newReport, error: createError } = await supabaseClient
            .from('reports')
            .insert({
              domain: cleanedDomain,
              slug: slugData,
              user_id: null, // Mark as admin import, not a user report
              report_data: {
                domain: cleanedDomain,
                avgTransactionValue: transactionValue,
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

          if (createError) {
            throw new Error(`Failed to create report: ${createError.message}`);
          }
          report = newReport;
          console.log(`Created new report for ${cleanedDomain} with slug: ${slugData}`);
        }

        // Check if prospect activity already exists
        const { data: existingActivity } = await supabaseClient
          .from('prospect_activities')
          .select('id')
          .eq('report_id', report.id)
          .maybeSingle();

        if (!existingActivity) {
          // Create prospect activity assigned to Kyle for AI enrichment
          const { error: activityError } = await supabaseClient
            .from('prospect_activities')
            .insert({
              report_id: report.id,
              status: 'new',
              activity_type: 'note',
              notes: `Bulk imported with full report - awaiting AI enrichment for contacts and icebreakers`,
              priority: 'cold',
              created_by: user.id,
              assigned_to: kyleUserId,
              assigned_by: user.id,
              assigned_at: new Date().toISOString(),
            });

          if (activityError) {
            throw new Error(`Failed to create activity: ${activityError.message}`);
          }
        }

        result.success++;
        console.log(`✓ Successfully processed ${cleanedDomain}: ${metrics.missedLeads} missed leads, $${metrics.monthlyRevenueLost.toFixed(0)}/mo lost`);

        // Rate limiting: wait 1.5 seconds between domains to avoid SpyFu rate limits
        if (i < dataRows.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

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
