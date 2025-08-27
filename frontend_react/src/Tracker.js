import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://sba-cmms.onrender.com/api";

// 🌍 Translations
const translations = {
  ar: {
    tracking: "متابعة البلاغ 📌",
    status: "الحالة",
    id: "رقم البلاغ",
    title: "العنوان",
    description: "الوصف",
    category: "الفئة",
    priority: "الأولوية",
    location: "الموقع",
    contact: "رقم المبلّغ",
    notes: "ملاحظات عامة",
    noNotes: "لا توجد ملاحظات",
    back: "🔙 الرجوع إلى بلاغاتي",
    loading: "⏳ جاري التحميل...",
    notFound: "❌ لم يتم العثور على البلاغ",
    serverError: "⚠️ خطأ في الاتصال بالخادم",
  },
  en: {
    tracking: "Track Request 📌",
    status: "Status",
    id: "Ticket ID",
    title: "Title",
    description: "Description",
    category: "Category",
    priority: "Priority",
    location: "Location",
    contact: "Requester Phone",
    notes: "Public Notes",
    noNotes: "No notes available",
    back: "🔙 Back to My Requests",
    loading: "⏳ Loading...",
    notFound: "❌ Request not found",
    serverError: "⚠️ Server connection error",
  },
};

function Tracker() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lang, setLang] = useState("ar");
  const t = translations[lang];

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE}/tickets/${id}`);
        const data = await res.json();
        if (data.ticket) {
          setTicket(data.ticket);
        } else {
          setError(t.notFound);
        }
      } catch {
        setError(t.serverError);
      }
    };
    fetchTicket();
  }, [id, lang]); // ⬅️ نعيد الترجمة مع تغيير اللغة

  if (error) {
    return (
      <div style={{ padding: 20, direction: lang === "ar" ? "rtl" : "ltr", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ padding: 20, direction: lang === "ar" ? "rtl" : "ltr" }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: 20,
        direction: lang === "ar" ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "auto",
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {/* 🌍 زر تبديل اللغة بعلم */}
        <button
          title={lang === "ar" ? "Switch to English" : "تبديل للعربية"}
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
            position: "absolute",
            top: 10,
            [lang === "ar" ? "left" : "right"]: 10,
          }}
        >
          {lang === "ar" ? "🇺🇸" : "🇸🇦"}
        </button>

        <h2 style={{ marginBottom: 20, color: "#003366" }}>{t.tracking}</h2>

        <div style={{ marginBottom: 8, color: "#660066", fontWeight: "bold" }}>
          {t.status}: {ticket.status}
        </div>
        <div style={{ marginBottom: 8 }}>
          🔢 <strong>{t.id}:</strong> {ticket.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          📌 <strong>{t.title}:</strong> {ticket.title}
        </div>
        <div style={{ marginBottom: 8 }}>
          📝 <strong>{t.description}:</strong> {ticket.description}
        </div>
        <div style={{ marginBottom: 8 }}>
          🗂️ <strong>{t.category}:</strong> {ticket.category || "—"}
        </div>
        <div style={{ marginBottom: 8 }}>
          ⚡ <strong>{t.priority}:</strong> {ticket.priority || "—"}
        </div>
        <div style={{ marginBottom: 8 }}>
          🏢 <strong>{t.location}:</strong> {ticket.location}
        </div>
        <div style={{ marginBottom: 8 }}>
          📱 <strong>{t.contact}:</strong> {ticket.contact}
        </div>
        <div style={{ marginTop: 12 }}>
          💬 <strong>{t.notes}:</strong> {ticket.public_notes || t.noNotes}
        </div>

        {/* ✅ زر رجوع */}
        <button
          onClick={() => navigate("/req")}
          style={{
            marginTop: 20,
            background: "#003366",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {t.back}
        </button>
      </div>
    </div>
  );
}

export default Tracker;