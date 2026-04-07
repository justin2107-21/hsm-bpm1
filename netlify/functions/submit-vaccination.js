const { createClient } = require('@supabase/supabase-js');

// Generate a UUID v4 without external dependency
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    const url = process.env.HSM_SUPABASE_URL;
    const key = process.env.HSM_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing environment variables' }),
      };
    }

    const { user_id, patient_name, vaccine, preferred_date, health_center, notes } = JSON.parse(event.body);
    
    if (!vaccine || !patient_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: vaccine, patient_name' }),
      };
    }

    const supabase = createClient(url, key);

    // Insert vaccination request into vaccinations table
    const { data, error } = await supabase
      .from('vaccinations')
      .insert({
        id: generateUUID(),
        user_id,
        patient_name,
        vaccine,
        vaccination_date: preferred_date || null,
        health_center: health_center || null,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message || 'Vaccination insertion failed',
          details: error.details || error.hint,
          code: error.code
        }),
      };
    }

    console.log('✅ Vaccination inserted successfully:', data.id);
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
