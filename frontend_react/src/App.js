import React from "react";
import { Routes, Route } from "react-router-dom";

// صفحاتك
import Requester from "./Requester";
import Tracker from "./Tracker";
import OpsDashboard from "./OpsDashboard";
import Footer from "./components/Footer";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* 👇 فقط Routes هنا */}
      <div style={{ flex: 1, paddingBottom: "20px" }}>
        <Routes>
          <Route path="/" element={<Requester />} />
          <Route path="/req" element={<Requester />} />
          <Route path="/track/:id" element={<Tracker />} />
          <Route path="/ops" element={<OpsDashboard />} />
        </Routes>
      </div>

      {/* ✅ الفوتر يظهر في كل الصفحات */}
      <Footer />
    </div>
  );
}

export default App;