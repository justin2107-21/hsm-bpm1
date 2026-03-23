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

    const { user_id, complaint_type, barangay, location, description } = JSON.parse(event.body);
    
    if (!complaint_type || !barangay) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: complaint_type, barangay' }),
      };
    }

    const supabase = createClient(url, key);

    // Insert complaint into sanitation_complaints table
    const { data, error } = await supabase
      .from('sanitation_complaints')
      .insert({
        citizen_id: user_id,
        complaint_type,
        barangay,
        location: location || null,
        description: description || null,
        date_submitted: new Date().toISOString().split('T')[0],
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message || 'Complaint insertion failed',
          details: error.details || error.hint,
          code: error.code
        }),
      };
    }

    console.log('✅ Complaint inserted successfully:', data.id);
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
