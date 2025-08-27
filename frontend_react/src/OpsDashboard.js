import React, { useEffect, useState } from "react";

const API_BASE = "https://sba-cmms.onrender.com/api";

const ADMIN_PASS = "admin123"; // change later

// 🌍 Translations
const translations = {
  ar: {
    loginTitle: "🔒 لوحة الصيانة",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    dashboard: "لوحة الصيانة 🛠️",
    open: "مفتوح",
    inProgress: "قيد التنفيذ",
    completed: "مكتمل",
    onHold: "معلق",
    referred: "محال",
    cannotAccess: "لا يمكن الوصول",
    allStatuses: "كل الحالات",
    allCategories: "كل الفئات",
    csv: "⬇️ تحميل CSV",
    table: "📋 جدول",
    cards: "🗂️ بطاقات",
    sortBy: "ترتيب حسب",
    date: "📅 التاريخ",
    priority: "⚡ الأولوية",
    status: "📌 الحالة",
    techReport: "🛠️ التقرير الفني",
    prev: "◀ السابق",
    next: "التالي ▶",
    page: "الصفحة",
    of: "من",
    noTickets: "لا توجد بلاغات مطابقة 🔍",
    id: "الرقم",
    title: "العنوان",
    description: "الوصف",
    category: "الفئة",
    location: "الموقع",
  },
  en: {
    loginTitle: "🔒 Ops Dashboard",
    password: "Password",
    loginBtn: "Login",
    dashboard: "Maintenance Dashboard 🛠️",
    open: "Open",
    inProgress: "In Progress",
    completed: "Completed",
    onHold: "On Hold",
    referred: "Referred",
    cannotAccess: "Cannot Access",
    allStatuses: "All Statuses",
    allCategories: "All Categories",
    csv: "⬇️ Download CSV",
    table: "📋 Table",
    cards: "🗂️ Cards",
    sortBy: "Sort by",
    date: "📅 Date",
    priority: "⚡ Priority",
    status: "📌 Status",
    techReport: "🛠️ Technician Report",
    prev: "◀ Prev",
    next: "Next ▶",
    page: "Page",
    of: "of",
    noTickets: "No matching tickets 🔍",
    id: "ID",
    title: "Title",
    description: "Description",
    category: "Category",
    location: "Location",
  },
};

function OpsDashboard() {
  const [lang, setLang] = useState("ar");
  const t = translations[lang];

  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [tickets, setTickets] = useState([]);
  const [kpi, setKpi] = useState({});
  const [sortBy, setSortBy] = useState("created_at");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/tickets`);
      const data = await res.json();
      setTickets(data.tickets || []);

      const kpiRes = await fetch(`${API_BASE}/tickets-kpi`);
      const kpiData = await kpiRes.json();
      setKpi(kpiData);
    } catch (err) {
      console.error("❌ Fetch error", err);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchData();
    }
  }, [auth]);

  const updateTicket = async (id, field, value) => {
    try {
      await fetch(`${API_BASE}/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
    } catch {
      alert("❌ Update failed");
    }
  };

  // فلترة وترتيب
  let displayedTickets = [...tickets];
  if (filterStatus) displayedTickets = displayedTickets.filter((t) => t.status === filterStatus);
  if (filterCategory) displayedTickets = displayedTickets.filter((t) => t.category === filterCategory);

  if (sortBy === "created_at") {
    displayedTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    displayedTickets.sort((a, b) => (order[a.priority] || 99) - (order[b.priority] || 99));
  } else if (sortBy === "status") {
    displayedTickets.sort((a, b) => a.status.localeCompare(b.status));
  }

  const totalPages = Math.ceil(displayedTickets.length / pageSize);
  const visibleTickets = displayedTickets.slice((page - 1) * pageSize, page * pageSize);

  const login = () => {
    if (pass === ADMIN_PASS) setAuth(true);
  };

  if (!auth) {
    return (
      <div style={{ padding: 16 }}>
        <button
          title={lang === "ar" ? "Switch to English" : "تبديل للعربية"}
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
            float: lang === "ar" ? "left" : "right",
          }}
        >
          {lang === "ar" ? "🇺🇸" : "🇸🇦"}
        </button>
        <h2>{t.loginTitle}</h2>
        <input
          type="password"
          placeholder={t.password}
          onChange={(e) => setPass(e.target.value)}
        />
        <button onClick={login}>{t.loginBtn}</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, direction: lang === "ar" ? "rtl" : "ltr", fontFamily: "Tahoma" }}>
      {/* 🌍 زر اللغة */}
      <button
        title={lang === "ar" ? "Switch to English" : "تبديل للعربية"}
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "24px",
          cursor: "pointer",
          float: lang === "ar" ? "left" : "right",
        }}
      >
        {lang === "ar" ? "🇺🇸" : "🇸🇦"}
      </button>

      <h2>{t.dashboard}</h2>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div>🔧 {t.open}: {kpi.open || 0}</div>
        <div>📝 {t.inProgress}: {kpi.in_progress || 0}</div>
        <div>✅ {t.completed}: {kpi.completed || 0}</div>
        <div>⏸️ {t.onHold}: {kpi.on_hold || 0}</div>
        <div>🔄 {t.referred}: {kpi.referred || 0}</div>
        <div>❌ {t.cannotAccess}: {kpi.cannot_access || 0}</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <label>{t.sortBy}: </label>
        <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">{t.date}</option>
          <option value="priority">{t.priority}</option>
          <option value="status">{t.status}</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">{t.allStatuses}</option>
          <option value="Open">{t.open}</option>
          <option value="In Progress">{t.inProgress}</option>
          <option value="Completed">{t.completed}</option>
          <option value="On Hold">{t.onHold}</option>
          <option value="Referred">{t.referred}</option>
          <option value="Cannot Access">{t.cannotAccess}</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">{t.allCategories}</option>
          <option value="Electrical">Electrical</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="General">General</option>
        </select>

        <button onClick={() => setView("table")}>{t.table}</button>
        <button onClick={() => setView("cards")}>{t.cards}</button>

        <div style={{ display: "flex", gap: 8, marginRight: "auto" }}>
  {/* 📂 تحميل عام */}
  <a
    href={`${API_BASE}/tickets-export?mode=public`}
    target="_blank"
    rel="noreferrer"
    style={{ textDecoration: "none", color: "#003366", fontWeight: "bold" }}
  >
    📂 تحميل عام
  </a>

  {/* 🔒 تحميل كامل */}
  <a
    href={`${API_BASE}/tickets-export?mode=all`}
    target="_blank"
    rel="noreferrer"
    style={{ textDecoration: "none", color: "#660000", fontWeight: "bold" }}
  >
    🔒 تحميل كامل
  </a>
</div>
      </div>

      {/* جدول */}
      {view === "table" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#003366", color: "#fff" }}>
              <th>{t.id}</th>
              <th>{t.title}</th>
              <th>{t.description}</th>
              <th>{t.category}</th>
              <th>{t.priority}</th>
              <th>{t.location}</th>
              <th>{t.date}</th>
              <th>{t.status}</th>
              <th>{t.techReport}</th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                  {t.noTickets}
                </td>
              </tr>
            ) : (
              visibleTickets.map((ticket) => (
                <tr key={ticket.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <a href={`/track/${ticket.id}`} target="_blank" rel="noreferrer" style={{ color: "#003366" }}>
                      {ticket.description && ticket.description.length > 40
                        ? ticket.description.substring(0, 40) + "..."
                        : ticket.description}
                    </a>
                  </td>
                  <td>
                    <select value={ticket.category || ""} onChange={(e) => updateTicket(ticket.id, "category", e.target.value)}>
                      <option value="">—</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="General">General</option>
                    </select>
                  </td>
                  <td>
                    <select value={ticket.priority || ""} onChange={(e) => updateTicket(ticket.id, "priority", e.target.value)}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td>{ticket.location}</td>
                  <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleString(lang === "ar" ? "ar-SA" : "en-US") : "—"}</td>
                  <td>
                    <select value={ticket.status || ""} onChange={(e) => updateTicket(ticket.id, "status", e.target.value)}>
                      <option value="Open">{t.open}</option>
                      <option value="In Progress">{t.inProgress}</option>
                      <option value="Completed">{t.completed}</option>
                      <option value="On Hold">{t.onHold}</option>
                      <option value="Referred">{t.referred}</option>
                      <option value="Cannot Access">{t.cannotAccess}</option>
                    </select>
                  </td>
                  <td>
                    <textarea rows={2} value={ticket.tech_report || ""} onChange={(e) => updateTicket(ticket.id, "tech_report", e.target.value)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* بطاقات */}
      {view === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {visibleTickets.map((t) => {
            const priorityColors = { High: "#ffcccc", Medium: "#fff2cc", Low: "#d9f2d9" };
            return (
              <div key={t.id} style={{ background: priorityColors[t.priority] || "#eee", padding: 16, borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <h4>{t.title} ({t.id})</h4>
                <p>{t.description && t.description.length > 60 ? t.description.substring(0, 60) + "..." : t.description}</p>
                <p>🗂️ 
                  <select value={t.category || ""} onChange={(e) => updateTicket(t.id, "category", e.target.value)}>
                    <option value="">—</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="General">General</option>
                  </select>
                </p>
                <p>⚡ 
                  <select value={t.priority || ""} onChange={(e) => updateTicket(t.id, "priority", e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </p>
                <p>📌 
                  <select value={t.status || ""} onChange={(e) => updateTicket(t.id, "status", e.target.value)}>
                    <option value="Open">{t.open}</option>
                    <option value="In Progress">{t.inProgress}</option>
                    <option value="Completed">{t.completed}</option>
                    <option value="On Hold">{t.onHold}</option>
                    <option value="Referred">{t.referred}</option>
                    <option value="Cannot Access">{t.cannotAccess}</option>
                  </select>
                </p>
                <p>🏢 {t.location}</p>
                <p>📅 {t.created_at ? new Date(t.created_at).toLocaleString(lang === "ar" ? "ar-SA" : "en-US") : "—"}</p>
                <p>🛠️ {t.techReport}: 
                  <textarea rows={2} value={t.tech_report || ""} onChange={(e) => updateTicket(t.id, "tech_report", e.target.value)} />
                </p>
                <a href={`/track/${t.id}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, padding: "6px 12px", background: "#003366", color: "#fff", borderRadius: 6, textDecoration: "none" }}>
                  🔎 {lang === "ar" ? "عرض كامل" : "View"}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 8 }}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          {t.prev}
        </button>
        <span>
          {t.page} {page} {t.of} {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          {t.next}
        </button>
      </div>
    </div>
  );
}

export default OpsDashboard;