import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 10 requests
const RATE_WINDOW = 60000; // per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Apply rate limiting per user
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `get-admins:${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey)) {
      console.warn('Rate limit exceeded for:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for the authenticated user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    );

    // Verify the user is authenticated and is an admin
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is an admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || !isAdminData) {
      console.error('Admin check error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Access denied: Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client to access auth.users
    const serviceRoleClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get all admin and super_admin user_roles
    const { data: adminRoles, error: rolesError } = await serviceRoleClient
      .from('user_roles')
      .select('user_id, role, created_at')
      .in('role', ['admin', 'super_admin']);

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch admin roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user details for each admin
    const adminUsers = [];
    for (const role of adminRoles) {
      const { data: { user }, error: userFetchError } = await serviceRoleClient.auth.admin.getUserById(role.user_id);
      if (userFetchError) {
        console.error('Error fetching user details:', userFetchError);
        continue; // Skip this user but continue with others
      }
      
      if (user) {
        adminUsers.push({
          id: role.user_id,
          email: user.email || 'Unknown',
          created_at: role.created_at,
          role: role.role
        });
      }
    }

    console.log('Successfully fetched admin users:', adminUsers.length);

    return new Response(
      JSON.stringify({ admins: adminUsers }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in get-admins function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});