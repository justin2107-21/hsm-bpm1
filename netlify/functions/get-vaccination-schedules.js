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
    
    if (!url || !key) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing environment variables' }),
      };
    }

    const supabase = createClient(url, key);

    // Fetch all vaccination schedules
    const { data, error } = await supabase
      .from('vaccination_schedules')
      .select('*')
      .order('vaccine', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message || 'Fetch failed',
          details: error.details || error.hint,
          code: error.code
        }),
      };
    }

    console.log('✅ Vaccination schedules fetched:', data?.length || 0, 'records');
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
