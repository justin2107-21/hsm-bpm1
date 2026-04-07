const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const url = process.env.HSM_SUPABASE_URL;
    const key = process.env.HSM_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing environment variables' }),
      };
    }

    const supabase = createClient(url, key);

    // Run the migration SQL
    const sql = `
      -- Disable RLS and make user_id nullable for resident_permits (academic project simplification)
      ALTER TABLE public.resident_permits DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.resident_permits DROP CONSTRAINT resident_permits_user_id_fkey;
      ALTER TABLE public.resident_permits ALTER COLUMN user_id DROP NOT NULL;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error && error.message && error.message.includes('exec_sql')) {
      // If exec_sql doesn't exist, try direct approach by running individual statements
      try {
        await supabase.rpc('exec', { command: 'ALTER TABLE public.resident_permits DISABLE ROW LEVEL SECURITY' });
        await supabase.rpc('exec', { command: 'ALTER TABLE public.resident_permits DROP CONSTRAINT resident_permits_user_id_fkey' });
        await supabase.rpc('exec', { command: 'ALTER TABLE public.resident_permits ALTER COLUMN user_id DROP NOT NULL' });
      } catch (innerError) {
        console.error('Could not execute via RPC:', innerError);
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Could not execute migration. Please run manually in Supabase SQL editor:',
            sql: sql
          }),
        };
      }
    }

    if (error) {
      console.error('Migration error:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Migration failed',
          details: error.message,
          sql: sql 
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        message: 'resident_permits table schema updated successfully',
        details: 'Disabled RLS, dropped FK constraint, made user_id nullable'
      }),
    };
  } catch (e) {
    console.error('Unexpected error:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message || 'Unknown error' }),
    };
  }
};
