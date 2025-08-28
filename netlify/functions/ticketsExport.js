// netlify/functions/ticketsExport.js
import { google } from "googleapis";
import { Parser } from "json2csv";

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
    const tickets = await getAllTickets();
    if (!tickets || tickets.length === 0) {
      return { statusCode: 404, body: "No tickets found" };
    }

    const mode = event.queryStringParameters.mode || "all";
    let fields;

    if (mode === "public") {
      fields = ["id", "title", "description", "category", "priority", "location", "contact", "status", "created_at"];
    } else {
      fields = Object.keys(tickets[0]);
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(tickets);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tickets_export_${mode}.csv"`,
      },
      body: csv,
    };
  } catch (err) {
    console.error("❌ ticketsExport error", err);
    return { statusCode: 500, body: "Failed to export CSV" };
  }
}