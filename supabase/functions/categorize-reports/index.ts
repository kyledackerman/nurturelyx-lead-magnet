import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const INDUSTRY_KEYWORDS = {
  hvac: ['hvac', 'heating', 'cooling', 'air', 'ac', 'furnace', 'mallard', 'brown', 'climate', 'comfort'],
  legal: ['law', 'attorney', 'legal', 'lawyer', 'counsel', 'justice', 'firm'],
  'real-estate': ['realty', 'homes', 'real', 'estate', 'property', 'house', 'realtor', 'realestate'],
  'home-services': ['flooring', 'plumbing', 'roofing', 'construction', 'spa', 'pool', 'landscape', 'cleaning', 'contractor', 'renovation'],
  automotive: ['auto', 'car', 'dealer', 'hyundai', 'vehicle', 'automotive', 'motors', 'honda', 'toyota', 'ford'],
  healthcare: ['medical', 'health', 'dental', 'clinic', 'fitness', 'wellness', 'doctor', 'hospital', 'care'],
};

interface Report {
  id: string;
  domain: string;
  report_data: {
    organicTraffic?: number;
    yearlyRevenueLost?: number;
  };
}

function detectIndustry(domain: string): string {
  const lowercaseDomain = domain.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowercaseDomain.includes(keyword)) {
        return industry;
      }
    }
  }
  
  return 'other';
}

function calculateTrafficTier(organicTraffic: number): string {
  if (organicTraffic >= 10000) return 'enterprise';
  if (organicTraffic >= 1001) return 'high';
  if (organicTraffic >= 101) return 'medium';
  return 'low';
}

function calculateCompanySize(organicTraffic: number, yearlyRevenueLost: number): string {
  if (organicTraffic >= 5000 || yearlyRevenueLost >= 500000) return 'large';
  if (organicTraffic >= 1000 || yearlyRevenueLost >= 100000) return 'medium';
  return 'small';
}

function extractCompanyName(domain: string): string {
  // Remove common TLDs and clean up
  const name = domain
    .replace(/\.(com|net|org|io|co|us)$/gi, '')
    .replace(/[-_]/g, ' ')
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return name;
}

function generateSEOTitle(companyName: string, industry: string, yearlyRevenueLost: number): string {
  const industryLabels: Record<string, string> = {
    hvac: 'HVAC',
    legal: 'Law Firm',
    'real-estate': 'Real Estate',
    'home-services': 'Home Services',
    automotive: 'Automotive',
    healthcare: 'Healthcare',
    other: 'Business',
  };
  
  const revenueLost = yearlyRevenueLost ? `$${Math.round(yearlyRevenueLost / 1000)}K` : '';
  return `${companyName} ${industryLabels[industry]} Revenue Loss Report ${revenueLost}`;
}

function generateSEODescription(companyName: string, industry: string, traffic: number, revenueLost: number): string {
  return `See how ${companyName} loses an estimated $${Math.round(revenueLost).toLocaleString()} yearly from ${traffic.toLocaleString()} website visitors. Free ${industry} identity resolution report.`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
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

    console.log('Starting report categorization...');

    // Fetch all reports
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select('id, domain, report_data')
      .is('industry', null) as { data: Report[] | null; error: any };

    if (fetchError) {
      throw new Error(`Failed to fetch reports: ${fetchError.message}`);
    }

    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No reports to categorize',
        categorized: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${reports.length} reports to categorize`);

    const updates = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each report
    for (const report of reports) {
      try {
        const industry = detectIndustry(report.domain);
        const organicTraffic = report.report_data?.organicTraffic || 0;
        const yearlyRevenueLost = report.report_data?.yearlyRevenueLost || 0;
        
        const trafficTier = calculateTrafficTier(organicTraffic);
        const companySize = calculateCompanySize(organicTraffic, yearlyRevenueLost);
        const companyName = extractCompanyName(report.domain);
        const seoTitle = generateSEOTitle(companyName, industry, yearlyRevenueLost);
        const seoDescription = generateSEODescription(companyName, industry, organicTraffic, yearlyRevenueLost);

        const { error: updateError } = await supabase
          .from('reports')
          .update({
            industry,
            company_size: companySize,
            monthly_traffic_tier: trafficTier,
            seo_title: seoTitle,
            seo_description: seoDescription,
            extracted_company_name: companyName,
          })
          .eq('id', report.id);

        if (updateError) {
          console.error(`Error updating report ${report.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
          updates.push({
            domain: report.domain,
            industry,
            companySize,
            trafficTier,
            companyName,
          });
        }
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Categorization complete: ${successCount} succeeded, ${errorCount} failed`);

    return new Response(JSON.stringify({
      message: 'Report categorization complete',
      totalReports: reports.length,
      successCount,
      errorCount,
      sampleUpdates: updates.slice(0, 10), // Show first 10 as examples
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-reports function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
