const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// อนุญาตให้ Frontend ทุกที่เข้าถึงได้ (หรือระบุ URL ของหน้าเว็บคุณ)
app.use(cors({ origin: "*" }));
app.use(express.json());

// เช็กสถานะ Server
app.get("/", (req, res) => {
  res.json({ status: "CE Learning Backend is running on Render 🚀" });
});

app.post("/api/chapter", async (req, res) => {
  const { subjectName, chapterTitle } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!subjectName || !chapterTitle) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน (subjectName, chapterTitle)" });
  }

  try {
    // ใช้ v1beta คู่กับ gemini-1.5-flash (เสถียรที่สุดสำหรับตอนนี้)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `สร้างบทเรียนวิทยาการคอมพิวเตอร์ วิชา ${subjectName} เรื่อง ${chapterTitle} เป็น JSON` }] }]
      })
    });

    const result = await response.json();

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    // ส่งข้อมูล JSON กลับไปที่หน้าบ้าน
    res.json({ success: true, data: result.candidates[0].content.parts[0].text });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "ระบบหลังบ้านขัดข้อง: " + err.message });
  }
});

// สำหรับ Render ต้องใช้ app.listen และใช้ Port ที่ระบบกำหนดให้ (process.env.PORT)
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
