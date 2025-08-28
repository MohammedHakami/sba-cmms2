// netlify/functions/health.js
export async function handler() {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, msg: "SBA-CMMS Backend is running ✅" }),
  };
}