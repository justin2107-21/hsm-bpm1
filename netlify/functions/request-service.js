const { createClient } = require('@supabase/supabase-js');

// Generate a UUID v4
function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Debug: Check if env vars are loaded
    const url = process.env.HSM_SUPABASE_URL;
    const key = process.env.HSM_SERVICE_ROLE_KEY;
    
    console.log('🔍 Netlify Function Debug:');
    console.log('HSM_SUPABASE_URL:', url ? '✅ Present' : '❌ Missing');
    console.log('HSM_SERVICE_ROLE_KEY:', key ? '✅ Present (first 20 chars: ' + key.substring(0, 20) + '...)' : '❌ Missing');

    if (!url || !key) {
      console.error('❌ Environment variables missing!');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Missing environment variables. Check netlify.toml or .env.local',
          debug: { hasURL: !!url, hasKey: !!key }
        }),
      };
    }

    // Parse the request body
    const { user_id, request_type, title, description, status = "submitted", reference_id, scheduled_date, scheduled_time } = JSON.parse(event.body);
    
    // Generate reference ID if not provided (UUID v4 format for database compatibility)
    const finalReferenceId = reference_id || generateUUIDv4();
    console.log('📝 Generated Reference ID:', finalReferenceId);

    // Validate required fields
    if (!user_id || !request_type || !title || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(url, key);

    // Insert the service request
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        user_id,
        request_type,
        title,
        description,
        status,
        reference_id: finalReferenceId,
        scheduled_date,
        scheduled_time
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message || 'Supabase insertion failed',
          details: error.details || error.hint || 'Check function logs for details',
          code: error.code
        }),
      };
    }

    console.log('✅ Request inserted successfully:', data.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };

  } catch (error) {
    console.error('❌ Function error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
