import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

// صفحاتك
import Requester from "./Requester";
import Tracker from "./Tracker";
import OpsDashboard from "./OpsDashboard";
import Footer from "./components/Footer";

function App() {
  const [lang, setLang] = useState("ar"); // ✅ اللغة الافتراضية
  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* ✅ شريط التنقل */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#003366",
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div>
          <Link
            to="/req"
            style={{ color: "white", textDecoration: "none", marginRight: "15px" }}
          >
            📋 {lang === "ar" ? "البلاغات" : "Requests"}
          </Link>
          <Link
            to="/ops"
            style={{ color: "white", textDecoration: "none" }}
          >
            🛠️ {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </Link>
        </div>

        {/* 🌍 زر تبديل اللغة */}
        <button
          onClick={toggleLang}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "22px",
            cursor: "pointer",
            color: "white",
          }}
        >
          {lang === "ar" ? "🇺🇸" : "🇸🇦"}
        </button>
      </nav>

      {/* 👇 فقط Routes هنا */}
      <div style={{ flex: 1, paddingBottom: "20px" }}>
        <Routes>
          <Route path="/" element={<Requester lang={lang} />} />
          <Route path="/req" element={<Requester lang={lang} />} />
          <Route path="/track/:id" element={<Tracker lang={lang} />} />
          <Route path="/ops" element={<OpsDashboard lang={lang} />} />
        </Routes>
      </div>

      {/* ✅ الفوتر يظهر في كل الصفحات */}
      <Footer />
    </div>
  );
}

export default App;