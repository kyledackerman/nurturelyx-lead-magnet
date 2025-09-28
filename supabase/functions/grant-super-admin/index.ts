import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Find Kyle's user ID by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const kyleUser = users.users.find(user => user.email === 'kyle@nurturely.io');
    
    if (!kyleUser) {
      console.error('Kyle user not found');
      return new Response(JSON.stringify({ error: 'Kyle user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found Kyle user:', kyleUser.id);

    // Check if Kyle already has super_admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', kyleUser.id)
      .eq('role', 'super_admin')
      .single();

    if (existingRole) {
      console.log('Kyle already has super_admin role');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Kyle already has super_admin role',
        userId: kyleUser.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Grant super_admin role to Kyle
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: kyleUser.id,
        role: 'super_admin'
      });

    if (roleError) {
      console.error('Error granting super_admin role:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to grant super_admin role' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully granted super_admin role to Kyle');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully granted super_admin role to kyle@nurturely.io',
      userId: kyleUser.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grant-super-admin function:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});