import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // Check if user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { application_id, action, admin_notes, rejection_reason } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action. Must be "approve" or "reject"' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'reject' && !rejection_reason) {
      return new Response(JSON.stringify({ error: 'Rejection reason required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!application_id) {
      return new Response(JSON.stringify({ error: 'application_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get application
    const { data: application, error: appError } = await serviceClient
      .from('ambassador_applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle rejection
    if (action === 'reject') {
      await serviceClient.from('ambassador_applications').update({
        status: 'rejected', reviewed_at: new Date().toISOString(),
        reviewed_by: user.id, rejection_reason
      }).eq('id', application_id);

      const { sendEmail } = await import('../_shared/emailService.ts');
      const { generateRejectionEmail } = await import('../_shared/emailTemplates.ts');
      try {
        await sendEmail({ to: application.email, subject: 'Ambassador Application Update',
          html: generateRejectionEmail(application.full_name, rejection_reason) });
      } catch (e) { console.error('Email failed:', e); }

      await serviceClient.from('audit_logs').insert({
        table_name: 'ambassador_applications', record_id: application_id,
        action_type: 'UPDATE', field_name: 'status', old_value: application.status,
        new_value: 'rejected', business_context: `Rejected: ${rejection_reason}`, changed_by: user.id
      });

      return new Response(JSON.stringify({ success: true, message: 'Application rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (application.status === 'approved') {
      return new Response(JSON.stringify({ error: 'Already approved' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await serviceClient.auth.admin.listUsers();
    const userExists = existingUser?.users?.find(u => u.email === application.email);

    let userId: string;

    if (!userExists) {
      // Create new user account
      const { data: newUser, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
        application.email,
        {
          data: {
            full_name: application.full_name,
            role: 'ambassador',
          },
        }
      );

      if (inviteError || !newUser.user) {
        console.error('Failed to create user:', inviteError);
        return new Response(JSON.stringify({ error: 'Failed to create user account', details: inviteError }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = newUser.user.id;
    } else {
      userId = userExists.id;
    }

    // Create ambassador profile
    const { data: profile, error: profileError } = await serviceClient
      .from('ambassador_profiles')
      .insert({
        user_id: userId,
        application_id: application.id,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        location: application.location,
        status: 'active',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create ambassador profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to create ambassador profile', details: profileError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Grant ambassador role
    const { error: roleError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'ambassador',
      });

    if (roleError) {
      console.error('Failed to grant ambassador role:', roleError);
    }

    // Update application status
    const { error: updateError } = await serviceClient
      .from('ambassador_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        user_id: userId,
      })
      .eq('id', application_id);

    if (updateError) {
      console.error('Failed to update application:', updateError);
    }

    // Send welcome email
    const { sendEmail } = await import('../_shared/emailService.ts');
    const { generateWelcomeEmail } = await import('../_shared/emailTemplates.ts');
    try {
      await sendEmail({ to: application.email, subject: 'Welcome to Nurturely Ambassador Program!',
        html: generateWelcomeEmail(application.full_name, userId) });
    } catch (e) { console.error('Email failed:', e); }

    await serviceClient.from('audit_logs').insert({
      table_name: 'ambassador_applications', record_id: application_id,
      action_type: 'UPDATE', field_name: 'status', old_value: application.status,
      new_value: 'approved', business_context: `Approved: ${application.email}`, changed_by: user.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        ambassador_profile_id: profile.id,
        message: 'Ambassador application approved successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in approve-ambassador-application:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
