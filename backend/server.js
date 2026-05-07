const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "CE Learning API is running 🚀" });
});

app.post("/api/chapter", async (req, res) => {
  const { subjectName, chapterTitle } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!subjectName || !chapterTitle) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
  }

  try {
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

    res.json({ success: true, data: result.candidates[0].content.parts[0].text });

  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// --- จุดที่ต้องแก้คือตรงนี้ครับ ---
// ลบ app.listen(PORT, ...) ของเดิมออก แล้วใช้บรรทัดนี้แทน:
module.exports = app; 
