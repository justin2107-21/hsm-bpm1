import { createClient } from "@supabase/supabase-js";

/**
 * Netlify Function: Search for citizens in CIE Supabase
 * Deployed at: /.netlify/functions/citizens-search
 * Usage: /api/citizens-search?q=justin
 */
export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
    };
  }

  // Only accept GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const q = (event.queryStringParameters?.q || "").trim();

  if (!q) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Missing query param: q",
        example: "?q=justin",
      }),
    };
  }

  try {
    // Create Supabase client for CIE project (using service role key)
    const cie = createClient(
      process.env.CIE_SUPABASE_URL,
      process.env.CIE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const { data, error } = await cie
      .from(process.env.CITIZENS_TABLE || "profiles")
      .select("*")
      .or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
      )
      .limit(100);

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data || []),
    };
  } catch (e) {
    console.error("Error in citizens-search:", e);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message || "Unknown error" }),
    };
  }
};
