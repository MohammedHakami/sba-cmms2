// netlify/functions/updateTicket.js
import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_ID;
const RANGE = "tickets";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

export async function handler(event) {
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const id = event.queryStringParameters.id;
    if (!id) return { statusCode: 400, body: "Missing ticket id" };

    const body = JSON.parse(event.body);

    const resGet = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = resGet.data.values;
    const headers = rows[0];
    const idx = rows.findIndex((row) => row[0] === id);

    if (idx === -1) {
      return { statusCode: 404, body: "Ticket not found" };
    }

    const row = rows[idx];
    headers.forEach((h, i) => {
      if (body[h] !== undefined) {
        row[i] = body[h];
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `tickets!A${idx + 1}:O${idx + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("❌ updateTicket error", err);
    return { statusCode: 500, body: "Failed to update ticket" };
  }
}