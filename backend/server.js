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
    const prompt = `คุณคือครูสอนวิทยาการคอมพิวเตอร์ระดับ ปวช ไทย สร้างบทเรียนสำหรับ:
วิชา: ${subjectName}
บท: ${chapterTitle}

ตอบเป็น JSON เท่านั้น ห้ามมี markdown:
{"intro":"บทนำ","sections":[{"title":"หัวข้อ 1","content":"เนื้อหา","code":"โค้ด","lang":"ภาษา"}],"keypoints":["จุดสำคัญ"],"quiz":[{"q":"คำถาม","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"}]}`;

    const apiKey = process.env.GEMINI_API_KEY;
    // บังคับยิงเข้า v1 โดยตรง ไม่ผ่าน SDK
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // ดึง Text ออกจากโครงสร้างของ Google API
    const raw = result.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const data = JSON.parse(clean);
    
    res.json({ success: true, data });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถสร้างเนื้อหาได้: " + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
