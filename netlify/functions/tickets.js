// netlify/functions/tickets.js
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

async function appendTicket(ticket) {
  const values = [[
    ticket.id,
    ticket.title,
    ticket.description,
    ticket.category,
    ticket.priority,
    ticket.location,
    ticket.contact,
    ticket.photo_url || "",
    ticket.status,
    ticket.public_notes || "",
    ticket.internal_notes || "",
    ticket.tech_name || "",
    ticket.tech_phone || "",
    ticket.created_at,
    ticket.tech_report || "",
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

function generateTicketId(tickets) {
  const today = new Date();
  const datePart = today.toISOString().slice(2, 10).replace(/-/g, "");
  const todayCount = tickets.filter((t) => t.id.startsWith(datePart)).length + 1;
  return `${datePart}-${String(todayCount).padStart(2, "0")}`;
}

export async function handler(event) {
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const allTickets = await getAllTickets();
      const ticketId = generateTicketId(allTickets);

      const newTicket = {
        id: ticketId,
        created_at: new Date().toISOString(),
        status: "Open",
        ...body,
      };

      await appendTicket(newTicket);
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, ticketId }),
      };
    }

    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters;
      const tickets = await getAllTickets();

      if (params.contact) {
        const filtered = tickets.filter((t) => t.contact === params.contact);
        return {
          statusCode: 200,
          body: JSON.stringify({ tickets: filtered }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ tickets }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error("❌ tickets.js error", err);
    return { statusCode: 500, body: "Server Error" };
  }
}