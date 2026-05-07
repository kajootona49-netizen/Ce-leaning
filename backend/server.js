const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "CE Learning API is running 🚀" });
});

app.post("/api/chapter", async (req, res) => {
  const { subjectName, chapterTitle } = req.body;
  if (!subjectName || !chapterTitle) {
    return res.status(400).json({ error: "กรุณาส่ง subjectName และ chapterTitle" });
  }

  try {
    const prompt = `คุณคือครูสอนวิทยาการคอมพิวเตอร์ระดับ ปวช ไทย สร้างบทเรียนสำหรับ: วิชา: ${subjectName} บท: ${chapterTitle} ตอบเป็น JSON เท่านั้น: {"intro":"...","sections":[{"title":"...","content":"...","code":"...","lang":"..."}],"keypoints":[],"quiz":[]}`;

    const apiKey = process.env.GEMINI_API_KEY;
    
    // เปลี่ยนกลับมาใช้ v1beta แต่ใช้ gemini-1.5-flash (คู่ที่ Google แนะนำที่สุดตอนนี้)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();

    // เช็กว่า Error ที่ส่งกลับมาจาก Google คืออะไรกันแน่
    if (result.error) {
      console.error("Google API Error:", result.error);
      return res.status(result.error.code || 500).json({ 
        error: `Google API Error: ${result.error.message}` 
      });
    }

    const raw = result.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const data = JSON.parse(clean);
    
    res.json({ success: true, data });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "ระบบขัดข้อง: " + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
