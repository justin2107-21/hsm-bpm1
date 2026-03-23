const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const url = process.env.HSM_SUPABASE_URL;
    const key = process.env.HSM_SERVICE_ROLE_KEY;
    
    console.log('🔍 Get Service Requests Function Debug:');
    console.log('HSM_SUPABASE_URL:', url ? '✅ Present' : '❌ Missing');
    console.log('HSM_SERVICE_ROLE_KEY:', key ? '✅ Present' : '❌ Missing');

    if (!url || !key) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Missing environment variables',
          debug: { hasURL: !!url, hasKey: !!key }
        }),
      };
    }

    // Get user_id from query parameter
    const userId = event.queryStringParameters?.userId;
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId parameter' }),
      };
    }

    console.log('📝 Fetching requests for user:', userId);

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(url, key);

    // Fetch the service requests
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message || 'Failed to fetch requests' }),
      };
    }

    console.log('✅ Fetched', data?.length || 0, 'requests');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: data || [] }),
    };

  } catch (error) {
    console.error('❌ Function error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
