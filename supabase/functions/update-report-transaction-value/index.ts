import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  reportId: string;
  newTransactionValue: number;
}

interface ReportData {
  avgTransactionValue: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: MonthlyRevenueData[];
  [key: string]: any;
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

function recalculateMetrics(
  reportData: ReportData,
  newTransactionValue: number
): Partial<ReportData> {
  const oldTransactionValue = reportData.avgTransactionValue;
  
  if (oldTransactionValue === newTransactionValue) {
    return {};
  }

  // Recalculate top-level metrics
  const estimatedSalesLost = reportData.estimatedSalesLost;
  const monthlyRevenueLost = estimatedSalesLost * newTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;

  // Recalculate monthly revenue data
  const updatedMonthlyRevenueData = reportData.monthlyRevenueData.map((monthData) => {
    const lostRevenue = monthData.lostSales * newTransactionValue;
    
    return {
      ...monthData,
      revenueLost: lostRevenue,
      lostRevenue: lostRevenue,
    };
  });

  return {
    avgTransactionValue: newTransactionValue,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
    monthlyRevenueData: updatedMonthlyRevenueData,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { reportId, newTransactionValue }: RequestBody = await req.json();

    console.log(`Updating transaction value for report ${reportId} to ${newTransactionValue}`);

    // Validate input
    if (!reportId || !newTransactionValue || newTransactionValue <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: reportId and positive newTransactionValue required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch the report
    const { data: report, error: fetchError } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      console.error('Report fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check permissions: user must own the report or be an admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin'])
      .single();

    const isOwner = report.user_id === user.id;
    const isAdmin = !!userRole;

    if (!isOwner && !isAdmin) {
      console.error('Permission denied: user is not owner or admin');
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const reportData = report.report_data as ReportData;
    const oldTransactionValue = reportData.avgTransactionValue;

    // Recalculate metrics
    const updatedMetrics = recalculateMetrics(reportData, newTransactionValue);

    if (Object.keys(updatedMetrics).length === 0) {
      return new Response(
        JSON.stringify({ error: 'New value is the same as current value' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the report with new calculated metrics
    const updatedReportData = {
      ...reportData,
      ...updatedMetrics,
    };

    const { error: updateError } = await supabaseClient
      .from('reports')
      .update({
        report_data: updatedReportData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Report update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update report' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the update in audit logs
    const auditContext = `Updated average transaction value from $${oldTransactionValue} to $${newTransactionValue}. New metrics: Monthly Revenue Lost: $${updatedMetrics.monthlyRevenueLost?.toFixed(2)}, Yearly Revenue Lost: $${updatedMetrics.yearlyRevenueLost?.toFixed(2)}`;
    
    await supabaseClient.rpc('log_business_context', {
      p_table_name: 'reports',
      p_record_id: reportId,
      p_context: auditContext,
    });

    console.log(`Successfully updated transaction value for report ${reportId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        updatedMetrics,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in update-report-transaction-value function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
