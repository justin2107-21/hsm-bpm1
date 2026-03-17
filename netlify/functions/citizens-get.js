import { createClient } from "@supabase/supabase-js";

/**
 * Netlify Function: Get citizen by ID
 * Deployed at: /.netlify/functions/citizens-get
 * Usage: /api/citizens-get?id=uuid
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

  const id = event.queryStringParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Missing ID parameter",
        example: "?id=uuid",
      }),
    };
  }

  try {
    // Create Supabase client for CIE project
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
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Citizen not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (e) {
    console.error("Error in citizens-get:", e);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message || "Unknown error" }),
    };
  }
};
