import React, { useState } from "react";


// 🔗 رابط الـ Backend الجديد
const API_BASE = "https://sba-cmms.onrender.com/api";

// 🔢 Normalize Arabic digits to English
const normalizeDigits = (input) => {
  if (!input) return "";
  return input.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

// 🌍 Translations
const translations = {
  ar: {
    newRequest: "📋 إرسال بلاغ جديد",
    trackRequests: "🔎 متابعة بلاغاتي",
    title: "عنوان البلاغ 📌",
    desc: "الوصف 📝",
    category: "الفئة 🗂️",
    priority: "الأولوية ⚡",
    location: "الموقع 🏢",
    customLocation: "أدخل الموقع 📍",
    contact: "رقم الجوال 📱",
    submit: "📨 إرسال البلاغ",
    showRequests: "📂 عرض البلاغات",
    success: "✅ تم إنشاء التذكرة بنجاح! رقمها:",
    errorCreate: "❌ لم يتم إنشاء البلاغ، تحقق من البيانات",
    errorServer: "⚠️ خطأ في الاتصال بالخادم",
    errorNoTickets: "❌ لا توجد بلاغات مرتبطة بهذا الرقم",
    langSwitch: "English",
  },
  en: {
    newRequest: "📋 Submit New Request",
    trackRequests: "🔎 Track My Requests",
    title: "Request Title 📌",
    desc: "Description 📝",
    category: "Category 🗂️",
    priority: "Priority ⚡",
    location: "Location 🏢",
    customLocation: "Enter Location 📍",
    contact: "Phone Number 📱",
    submit: "📨 Submit Request",
    showRequests: "📂 Show Requests",
    success: "✅ Ticket created successfully! ID:",
    errorCreate: "❌ Failed to create request, check input",
    errorServer: "⚠️ Server connection error",
    errorNoTickets: "❌ No requests found for this number",
    langSwitch: "العربية",
  },
};

function Requester() {
  const [lang, setLang] = useState("ar");
  const t = translations[lang];

  const [form, setForm] = useState({});
  const [customLocation, setCustomLocation] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [errorSubmit, setErrorSubmit] = useState(null);
  const [errorTrack, setErrorTrack] = useState(null);
  const [trackPhone, setTrackPhone] = useState("");
  const [tab, setTab] = useState("new");

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "contact") {
      value = normalizeDigits(value);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    setErrorSubmit(null);
    setTicketId(null);

    const payload = {
      ...form,
      location: form.location === "Other" ? customLocation : form.location,
    };

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ticketId) {
        setTicketId(data.ticketId);
      } else {
        setErrorSubmit(t.errorCreate);
      }
    } catch {
      setErrorSubmit(t.errorServer);
    }
  };

  const trackByPhone = async () => {
    setErrorTrack(null);
    setTickets([]);
    try {
      const res = await fetch(`${API_BASE}/tickets?contact=${normalizeDigits(trackPhone)}`);
      const data = await res.json();
      if (data.tickets && data.tickets.length > 0) {
        setTickets(data.tickets);
      } else {
        setErrorTrack(t.errorNoTickets);
      }
    } catch {
      setErrorTrack(t.errorServer);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: 20, direction: lang === "ar" ? "rtl" : "ltr" }}>
      <div style={{ maxWidth: 600, margin: "auto", background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        
        {/* 🌍 زر تغيير اللغة */}
        <button 
  title={lang === "ar" ? "Switch to English" : "تبديل للعربية"} 
  onClick={() => setLang(lang === "ar" ? "en" : "ar")}
  style={{
    border: "none",
    background: "transparent",
    fontSize: "24px",
    cursor: "pointer",
  }}
>
  {lang === "ar" ? "🇺🇸" : "🇸🇦"}
</button>

        {/* تبويبات */}
        <div style={{ display: "flex", marginBottom: 20 }}>
          <button onClick={() => setTab("new")} style={{ flex: 1, padding: 12, border: "none", cursor: "pointer", fontWeight: "bold", background: tab === "new" ? "#003366" : "#eee", color: tab === "new" ? "#fff" : "#333", borderRadius: "8px 8px 0 0" }}>{t.newRequest}</button>
          <button onClick={() => setTab("track")} style={{ flex: 1, padding: 12, border: "none", cursor: "pointer", fontWeight: "bold", background: tab === "track" ? "#003366" : "#eee", color: tab === "track" ? "#fff" : "#333", borderRadius: "8px 8px 0 0" }}>{t.trackRequests}</button>
        </div>

        {/* 📌 إرسال بلاغ جديد */}
        {tab === "new" && (
          <form onSubmit={submitTicket} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            <label>{t.title}
              <input name="title" placeholder={t.title} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
            </label>

            <label>{t.desc}
              <textarea name="description" placeholder={t.desc} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", minHeight: 80 }}/>
            </label>

            <label>{t.category}
              <select name="category" onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
                <option value="">{t.category}</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="General">General</option>
              </select>
            </label>

            <label>{t.priority}
              <select name="priority" onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
                <option value="">{t.priority}</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label>{t.location}
              <select name="location" onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}>
                <option value="">{t.location}</option>
                {[...Array(14)].map((_, i) => (
                  <option key={i}>Studio {i + 1}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>

            {form.location === "Other" && (
              <label>{t.customLocation}
                <input value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder={t.customLocation} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
              </label>
            )}

            <label>{t.contact}
              <input name="contact" placeholder={t.contact} onChange={handleChange} required type="tel" style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}/>
            </label>

            <button type="submit" style={{ background: "#006633", color: "#fff", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>{t.submit}</button>
          </form>
        )}

        {/* ✅ رسائل */}
        {ticketId && <div style={{ marginTop: 12, padding: 12, background: "#e6ffe6", border: "1px solid #00b300", borderRadius: 8, color: "#006600" }}>{t.success} <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{ticketId}</span></div>}
        {errorSubmit && <div style={{ marginTop: 12, padding: 12, background: "#ffe6e6", border: "1px solid #ff4d4d", borderRadius: 8, color: "red" }}>{errorSubmit}</div>}

        {/* 📌 متابعة البلاغات */}
        {tab === "track" && (
          <div>
            <label>{t.contact}
              <input value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} placeholder={t.contact} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginBottom: 8 }}/>
            </label>
            <button onClick={trackByPhone} style={{ background: "#006633", color: "#fff", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginBottom: 12 }}>{t.showRequests}</button>

            {errorTrack && <div style={{ marginTop: 12, padding: 12, background: "#ffe6e6", border: "1px solid #ff4d4d", borderRadius: 8, color: "red" }}>{errorTrack}</div>}

            {tickets.length > 0 && <div style={{ marginTop: 16 }}>{tickets.map((ticket) => (
              <a key={ticket.id} href={`/track/${ticket.id}`} style={{ display: "block", padding: "12px", marginBottom: "8px", borderRadius: "8px", background: "#f1f1f1", border: "1px solid #ddd", textDecoration: "none", color: "#003366", fontWeight: "bold" }}>
                {ticket.id} - {ticket.status} - {ticket.location}
              </a>
            ))}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Requester;