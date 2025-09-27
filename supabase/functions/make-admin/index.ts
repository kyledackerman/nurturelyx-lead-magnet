import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if the requesting user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_admin', { user_uuid: user.id })
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create service role client for admin operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user by email using service client
    const { data: userData, error: userError } = await serviceClient.auth.admin.listUsers()
    if (userError) throw userError

    const targetUser = userData.users.find(u => u.email === email)
    
    if (!targetUser) {
      // User doesn't exist - send invitation email
      const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
        data: { 
          invited_as_admin: true,
          invited_by: user.email 
        },
        redirectTo: `${req.headers.get('origin') || 'https://x1.nurturely.io'}/admin`
      })
      
      if (inviteError) {
        throw new Error(`Failed to send invitation: ${inviteError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          message: 'Admin invitation sent successfully',
          email: email,
          invited_user_id: inviteData.user?.id
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // User exists - check if already admin
    const { data: existingRole, error: checkError } = await serviceClient
      .from('user_roles')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('role', 'admin')
      .single()

    if (existingRole) {
      return new Response(
        JSON.stringify({ message: 'User is already an admin' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add admin role to existing user
    const { error: insertError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: targetUser.id,
        role: 'admin'
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        message: 'User successfully granted admin access',
        user_id: targetUser.id,
        email: targetUser.email
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})