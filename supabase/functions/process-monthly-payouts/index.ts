import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MINIMUM_PAYOUT = 100.00;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      payout_period_start, 
      payout_period_end,
      batch_name,
      dry_run = false 
    } = await req.json();

    if (!payout_period_start || !payout_period_end) {
      return new Response(JSON.stringify({ error: 'payout_period_start and payout_period_end are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if batch already exists for this period
    const { data: existingBatch } = await serviceClient
      .from('payout_batches')
      .select('id')
      .eq('payout_period_start', payout_period_start)
      .eq('payout_period_end', payout_period_end)
      .single();

    if (existingBatch && !dry_run) {
      return new Response(JSON.stringify({ error: 'Payout batch already exists for this period' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find eligible ambassadors
    const { data: eligibleCommissions, error: commissionsError } = await serviceClient
      .from('commissions')
      .select('ambassador_id, commission_amount, id')
      .eq('status', 'eligible')
      .lte('eligible_for_payout_at', new Date().toISOString());

    if (commissionsError) {
      console.error('Failed to fetch commissions:', commissionsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch eligible commissions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group by ambassador
    const ambassadorTotals: Record<string, { total: number; commissions: any[] }> = {};
    
    for (const comm of eligibleCommissions || []) {
      if (!ambassadorTotals[comm.ambassador_id]) {
        ambassadorTotals[comm.ambassador_id] = { total: 0, commissions: [] };
      }
      ambassadorTotals[comm.ambassador_id].total += parseFloat(comm.commission_amount);
      ambassadorTotals[comm.ambassador_id].commissions.push(comm);
    }

    // Filter ambassadors meeting minimum threshold
    const eligibleAmbassadors = Object.entries(ambassadorTotals)
      .filter(([_, data]) => data.total >= MINIMUM_PAYOUT)
      .map(([ambassadorId, data]) => ({ ambassadorId, ...data }));

    if (eligibleAmbassadors.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No ambassadors meet the minimum payout threshold',
          total_ambassadors: 0,
          total_amount: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get ambassador profiles
    const { data: profiles, error: profilesError } = await serviceClient
      .from('ambassador_profiles')
      .select('user_id, full_name, email, payment_method')
      .in('user_id', eligibleAmbassadors.map(a => a.ambassadorId));

    if (profilesError) {
      console.error('Failed to fetch ambassador profiles:', profilesError);
    }

    const ambassadorDetails = eligibleAmbassadors.map(a => {
      const profile = profiles?.find(p => p.user_id === a.ambassadorId);
      return {
        ambassador_id: a.ambassadorId,
        full_name: profile?.full_name || 'Unknown',
        email: profile?.email || 'Unknown',
        commission_count: a.commissions.length,
        payout_amount: a.total,
        payment_method: profile?.payment_method || 'not_set',
      };
    });

    if (dry_run) {
      return new Response(
        JSON.stringify({
          success: true,
          preview_only: true,
          total_ambassadors: eligibleAmbassadors.length,
          total_amount: eligibleAmbassadors.reduce((sum, a) => sum + a.total, 0),
          ambassadors_paid: ambassadorDetails,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create payout batch
    const totalAmount = eligibleAmbassadors.reduce((sum, a) => sum + a.total, 0);
    const totalCommissions = eligibleAmbassadors.reduce((sum, a) => sum + a.commissions.length, 0);

    const { data: batch, error: batchError } = await serviceClient
      .from('payout_batches')
      .insert({
        batch_name: batch_name || `Payout ${new Date(payout_period_start).toLocaleDateString()} - ${new Date(payout_period_end).toLocaleDateString()}`,
        payout_period_start,
        payout_period_end,
        total_ambassadors: eligibleAmbassadors.length,
        total_commission_amount: totalAmount,
        total_commissions_count: totalCommissions,
        status: 'processing',
        processed_by: user.id,
      })
      .select()
      .single();

    if (batchError) {
      console.error('Failed to create payout batch:', batchError);
      return new Response(JSON.stringify({ error: 'Failed to create payout batch' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each ambassador
    for (const ambassador of eligibleAmbassadors) {
      // Update commissions
      const commissionIds = ambassador.commissions.map(c => c.id);
      
      await serviceClient
        .from('commissions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payout_batch_id: batch.id,
        })
        .in('id', commissionIds);

      // Update ambassador profile
      await serviceClient
        .from('ambassador_profiles')
        .update({
          eligible_commission: 0, // Reset to 0 after payout
          lifetime_commission_paid: serviceClient.rpc('increment', { amount: ambassador.total }),
        })
        .eq('user_id', ambassador.ambassadorId);
    }

    // Send payout emails
    const { sendEmail } = await import('../_shared/emailService.ts');
    const { generatePayoutProcessedEmail } = await import('../_shared/emailTemplates.ts');
    for (const amb of eligibleAmbassadors) {
      const prof = profiles?.find(p => p.user_id === amb.ambassadorId);
      if (prof?.email) {
        try {
          await sendEmail({ to: prof.email, subject: 'Monthly Payout Processed',
            html: generatePayoutProcessedEmail(prof.full_name || 'Ambassador', amb.total,
              new Date().toLocaleDateString(), { platformFee: amb.total * 0.6, perLead: amb.total * 0.4 }) });
        } catch (e) { console.error('Email failed:', e); }
      }
    }

    await serviceClient.from('payout_batches').update({
      status: 'completed', completed_at: new Date().toISOString()
    }).eq('id', batch.id);

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batch.id,
        total_ambassadors: eligibleAmbassadors.length,
        total_amount: totalAmount,
        ambassadors_paid: ambassadorDetails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-monthly-payouts:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
