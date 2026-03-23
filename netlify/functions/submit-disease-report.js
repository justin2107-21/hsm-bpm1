const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
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

    const { user_id, disease, location, details } = JSON.parse(event.body);
    
    if (!user_id || !disease) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: user_id, disease' }),
      };
    }

    const supabase = createClient(url, key);

    // Insert disease case into disease_reports table
    const { data, error } = await supabase
      .from('disease_reports')
      .insert({
        disease,
        patient_location: location || null,
        details: details || null,
        reported_by: user_id,
        reporter: 'Citizen Report',
        case_date: new Date().toISOString().split('T')[0],
        status: 'Submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message || 'Disease report insertion failed',
          details: error.details || error.hint,
          code: error.code
        }),
      };
    }

    console.log('✅ Disease report inserted successfully:', data.id);
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
