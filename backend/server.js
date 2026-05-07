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

ตอบเป็น JSON เท่านั้น ห้ามมี markdown ห้ามมี backtick:
{"intro":"บทนำ 3-4 ประโยค","sections":[{"title":"หัวข้อ 1","content":"อธิบาย 4-5 ประโยค","code":"โค้ดตัวอย่าง 10-15 บรรทัด","lang":"python หรือ c หรือ sql หรือ html หรือ javascript"},{"title":"หัวข้อ 2","content":"...","code":"...","lang":"..."},{"title":"หัวข้อ 3","content":"...","code":"...","lang":"..."}],"keypoints":["จุด 1","จุด 2","จุด 3","จุด 4"],"quiz":[{"q":"คำถาม?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"},{"q":"คำถาม 2?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"},{"q":"คำถาม 3?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"}]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const json = await response.json();
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = raw.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(clean);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถสร้างเนื้อหาได้: " + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
