
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMSMAN_API_TOKEN = Deno.env.get('SMSMAN_API_TOKEN');
const SMSMAN_BASE_URL = 'http://api.sms-man.ru/control';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    if (!SMSMAN_API_TOKEN) {
      throw new Error('SMS-Man API token not configured');
    }

    let apiUrl = `${SMSMAN_BASE_URL}/${action}?token=${SMSMAN_API_TOKEN}`;
    
    // Add additional parameters to the URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        apiUrl += `&${key}=${encodeURIComponent(String(value))}`;
      }
    });

    console.log('SMS-Man API request:', { action, params });

    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('SMS-Man API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sms-service function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      error_code: 'INTERNAL_ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
