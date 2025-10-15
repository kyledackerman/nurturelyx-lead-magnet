import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Extract JWT from Authorization header and get the authenticated user
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!jwt) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userResult, error: userError } = await supabase.auth.getUser(jwt);
    const user = userResult?.user;

    console.log('Authentication check:', { 
      hasUser: !!user, 
      userId: user?.id,
      userError: userError?.message,
      tokenPrefix: jwt.substring(0, 12) + '...'
    });

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_uuid: user.id });

    console.log('Admin check result:', { isAdmin, adminCheckError: adminCheckError?.message });

    if (adminCheckError || !isAdmin) {
      console.error('Admin check failed:', adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reportId } = await req.json();
    console.log('Processing report ID:', reportId);

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if report exists
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, domain, report_data')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if prospect activity already exists
    const { data: existingActivity } = await supabase
      .from('prospect_activities')
      .select('id')
      .eq('report_id', reportId)
      .maybeSingle();

    if (existingActivity) {
      return new Response(
        JSON.stringify({ error: 'Report already in CRM', alreadyExists: true }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate priority from report data
    const reportData = report.report_data as any;
    const missedLeads = Number(reportData?.missedLeads) || 0;
    const monthlyRevenue = reportData?.monthlyRevenueLost || 0;
    
    // Prevent adding prospects with zero lead potential
    if (missedLeads === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot add to CRM: This domain has 0 missed leads',
          leadPotential: false,
          missedLeads: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let priority = 'cold';
    if (missedLeads >= 1000) {
      priority = 'hot';
    } else if (missedLeads >= 500) {
      priority = 'warm';
    }

    // Create prospect activity
    const { data: activity, error: activityError } = await supabase
      .from('prospect_activities')
      .insert({
        report_id: reportId,
        activity_type: 'assignment',
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        status: 'new',
        priority: priority,
        notes: `Manually added to CRM by admin${missedLeads > 0 ? ` (~${missedLeads.toLocaleString()} potential leads/month)` : ''}${monthlyRevenue > 0 ? ` ($${monthlyRevenue.toLocaleString()}/month opportunity)` : ''}`
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error creating prospect activity:', activityError);
      return new Response(
        JSON.stringify({ error: 'Failed to add to CRM', details: activityError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Manually added ${report.domain} to CRM by admin ${user.id} (${priority} priority)`);

    // Auto-create "Send proposal" task if there's revenue loss
    let taskCreated = false;
    if (monthlyRevenue > 0) {
      try {
        // Calculate due date based on priority
        const now = new Date();
        let hoursUntilDue = 72; // default: cold prospects
        if (priority === 'hot') {
          hoursUntilDue = 24;
        } else if (priority === 'warm') {
          hoursUntilDue = 48;
        }
        
        const dueDate = new Date(now.getTime() + hoursUntilDue * 60 * 60 * 1000);
        
        const { error: taskError } = await supabase
          .from('prospect_tasks')
          .insert({
            title: 'Send proposal',
            description: `High-value prospect with $${monthlyRevenue.toLocaleString()}/month revenue opportunity. ${priority === 'hot' ? 'URGENT - ' : ''}Priority proposal needed.`,
            due_date: dueDate.toISOString(),
            report_id: reportId,
            prospect_activity_id: activity.id,
            status: 'pending',
            assigned_to: user.id,
          });

        if (taskError) {
          console.error('Error creating auto-task:', taskError);
        } else {
          taskCreated = true;
          console.log(`Auto-created "Send proposal" task for ${report.domain} (due in ${hoursUntilDue}h)`);
        }
      } catch (taskError) {
        console.error('Failed to create auto-task:', taskError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        activity,
        taskCreated,
        message: taskCreated ? 'Successfully added to CRM with auto-generated task' : 'Successfully added to CRM'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-to-crm function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
