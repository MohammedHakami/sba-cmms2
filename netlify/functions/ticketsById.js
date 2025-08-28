// netlify/functions/ticketsById.js
import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_ID;
const RANGE = "tickets";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

async function getAllTickets() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values || [];
  const headers = rows[0];
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((h, i) => [h, row[i]]))
  );
}

export async function handler(event) {
  try {
    const id = event.queryStringParameters.id;
    if (!id) return { statusCode: 400, body: "Missing id" };

    const tickets = await getAllTickets();
    const ticket = tickets.find((t) => t.id === id);

    return {
      statusCode: 200,
      body: JSON.stringify({ ticket }),
    };
  } catch (err) {
    console.error("❌ ticketsById error", err);
    return { statusCode: 500, body: "Server Error" };
  }
}