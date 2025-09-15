import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { reportData, userId = null } = body;

    if (!reportData || !reportData.domain) {
      return new Response(
        JSON.stringify({ error: 'Report data and domain are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique slug
    const { data: slugData, error: slugError } = await supabase.rpc(
      'generate_report_slug', 
      { domain_name: reportData.domain }
    );

    if (slugError) {
      console.error('Error generating slug:', slugError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report slug' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save report to database
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        domain: reportData.domain,
        report_data: reportData,
        slug: slugData,
        is_public: true
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error('Error saving report:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const publicUrl = `${req.headers.get('origin') || 'https://apjlauuidcbvuplfcshg.supabase.co'}/report/${data.slug}`;

    return new Response(
      JSON.stringify({ 
        reportId: data.id, 
        slug: data.slug,
        publicUrl,
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});