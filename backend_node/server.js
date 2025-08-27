import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Parser } from "json2csv"; // لازم تثبت البكج

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// ✅ Google Sheets إعداد الاتصال مع
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SHEET_ID = process.env.SHEET_ID;
const RANGE = "tickets";

// ✅ دالة قراءة جميع التذاكر
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

// ✅ دالة إضافة تذكرة
async function appendTicket(ticket) {
  const values = [
    [
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
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

// ✅ دالة لتوليد رقم التذكرة YYMMDD-XX
function generateTicketId(tickets) {
  const today = new Date();
  const datePart = today
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, ""); // مثال: 250826

  const todayCount = tickets.filter((t) => t.id.startsWith(datePart)).length + 1;
  return `${datePart}-${String(todayCount).padStart(2, "0")}`;
}

// ✅ إنشاء بلاغ جديد
app.post("/api/tickets", async (req, res) => {
  try {
    const allTickets = await getAllTickets();
    const ticketId = generateTicketId(allTickets);

    const newTicket = {
      id: ticketId,
      created_at: new Date().toISOString(),
      status: "Open",
      ...req.body,
    };

    await appendTicket(newTicket);
    res.json({ ok: true, ticketId });
  } catch (err) {
    console.error("❌ Error creating ticket", err);
    res.status(500).json({ ok: false, error: "Failed to create ticket" });
  }
});

// ✅ جلب جميع التذاكر (للـ Admin)
app.get("/api/admin/tickets", async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json({ tickets });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// ✅ جلب تذكرة معينة
app.get("/api/tickets/:id", async (req, res) => {
  try {
    const tickets = await getAllTickets();
    const ticket = tickets.find((t) => t.id === req.params.id);
    res.json({ ticket });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// ✅ جلب التذاكر حسب رقم الجوال (مع التطبيع)
app.get("/api/tickets", async (req, res) => {
  try {
    const contact = (req.query.contact || "").trim();
    const tickets = await getAllTickets();

    if (contact) {
      const normalize = (num) =>
        num ? num.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).trim() : "";

      const filtered = tickets.filter(
        (t) => normalize(t.contact) === normalize(contact)
      );

      return res.json({ tickets: filtered });
    }

    res.json({ tickets });
  } catch (err) {
    console.error("❌ Error fetching tickets by contact", err);
    res.status(500).json({ ok: false });
  }
});

// ✅ تحديث تذكرة (status / notes / etc)
app.patch("/api/tickets/:id", async (req, res) => {
  try {
    const resGet = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });
    const rows = resGet.data.values;
    const headers = rows[0];
    const idx = rows.findIndex((row) => row[0] === req.params.id);

    if (idx === -1) return res.status(404).json({ ok: false });

    const row = rows[idx];
    headers.forEach((h, i) => {
      if (req.body[h] !== undefined) {
        row[i] = req.body[h];
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `tickets!A${idx + 1}:O${idx + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error updating ticket", err);
    res.status(500).json({ ok: false });
  }
});

// ✅ KPI
app.get("/api/tickets-kpi", async (req, res) => {
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
    res.json(kpi);
  } catch {
    res.status(500).json({});
  }
});

// ✅ Export tickets as CSV (يدعم mode=public أو all)
app.get("/api/tickets-export", async (req, res) => {
  try {
    const tickets = await getAllTickets();
    if (!tickets || tickets.length === 0) {
      return res.status(404).send("No tickets found");
    }

    const mode = req.query.mode || "all"; // ?mode=public أو ?mode=all
    let fields;

    if (mode === "public") {
      fields = [
        "id",
        "title",
        "description",
        "category",
        "priority",
        "location",
        "contact",
        "status",
        "created_at",
      ];
    } else {
      fields = Object.keys(tickets[0]);
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(tickets);

    res.header("Content-Type", "text/csv");
    res.attachment(`tickets_export_${mode}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("❌ Error exporting CSV", err);
    res.status(500).send("Failed to export CSV");
  }
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, msg: "SBA-CMMS Backend is running ✅" });
});

app.listen(PORT, () =>
  console.log(`🚀 SBA-CMMS Backend running on http://localhost:${PORT}`)
);