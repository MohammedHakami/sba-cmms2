// netlify/functions/adminTickets.js
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

export async function handler() {
  try {
    const tickets = await getAllTickets();
    return {
      statusCode: 200,
      body: JSON.stringify({ tickets }),
    };
  } catch (err) {
    console.error("❌ adminTickets error", err);
    return { statusCode: 500, body: "Server Error" };
  }
}