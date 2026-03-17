/**
 * Netlify Function: Health check
 * Deployed at: /.netlify/functions/health
 */
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ ok: true, timestamp: new Date().toISOString() }),
  };
};
