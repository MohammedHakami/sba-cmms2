// netlify/functions/ticketsKPI.js
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
    const kpi = {
      open: tickets.filter((t) => t.status === "Open").length,
      in_progress: tickets.filter((t) => t.status === "In Progress").length,
      completed: tickets.filter((t) => t.status === "Completed").length,
      on_hold: tickets.filter((t) => t.status === "On Hold").length,
      referred: tickets.filter((t) => t.status === "Referred").length,
      cannot_access: tickets.filter((t) => t.status === "Cannot Access").length,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(kpi),
    };
  } catch (err) {
    console.error("❌ ticketsKPI error", err);
    return { statusCode: 500, body: "Server Error" };
  }
}