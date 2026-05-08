const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// อนุญาตให้หน้าบ้านเข้าถึงได้
app.use(cors({ origin: "*" }));
app.use(express.json());

// 1. หน้าแรกสำหรับเช็กว่า Server ออนไลน์หรือยัง
app.get("/", (req, res) => {
  res.send("<h1>CE Learning API is Online! 🚀</h1><p>Backend is working perfectly on Render.</p>");
});

// 2. API สำหรับสร้างเนื้อหาบทเรียน
app.post("/api/chapter", async (req, res) => {
  const { subjectName, chapterTitle } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!subjectName || !chapterTitle) {
    return res.status(400).json({ error: "กรุณาส่ง subjectName และ chapterTitle มาด้วยครับ" });
  }

  try {
    // ใช้ Prompt ที่บังคับให้ตอบเป็น JSON เพื่อให้หน้าบ้านเอาไปใช้ง่ายๆ
    const prompt = `คุณคือครูสอนคอมพิวเตอร์ ปวช. ไทย สร้างบทเรียนวิชา ${subjectName} เรื่อง ${chapterTitle} 
    ตอบเป็น JSON เท่านั้น (ห้ามมี Markdown Backticks):
    {
      "intro": "บทนำ",
      "sections": [{"title": "หัวข้อ", "content": "เนื้อหา", "code": "โค้ดตัวอย่าง", "lang": "ภาษา"}],
      "keypoints": ["จุดสำคัญ"],
      "quiz": [{"q": "คำถาม", "choices": ["ก", "ข", "ค", "ง"], "a": "ข้อที่ถูก", "explain": "คำอธิบาย"}]
    }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();

    if (result.error) {
      return res.status(500).json({ error: "Google API Error: " + result.error.message });
    }

    // ดึงเนื้อหาออกมาและทำความสะอาดเผื่อ AI ใส่โค้ดส่วนเกินมา
    let rawText = result.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const data = JSON.parse(cleanJson);
    
    res.json({ success: true, data });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "ขออภัย ระบบหลังบ้านขัดข้อง: " + err.message });
  }
});

// 3. ตั้งค่า Port สำหรับ Render (สำคัญมาก)
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
