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
    const prompt = `สร้างบทเรียนวิทยาการคอมพิวเตอร์ ปวช:
วิชา: ${subjectName}
บท: ${chapterTitle}

ตอบ JSON เท่านั้น ไม่มี markdown:
{"intro":"บทนำ 2-3 ประโยค","sections":[{"title":"หัวข้อ 1","content":"อธิบาย 3 ประโยค","code":"โค้ด 8 บรรทัด","lang":"python"},{"title":"หัวข้อ 2","content":"อธิบาย 3 ประโยค","code":"โค้ด 8 บรรทัด","lang":"python"}],"keypoints":["จุด 1","จุด 2","จุด 3"],"quiz":[{"q":"คำถาม?","choices":["ก","ข","ค","ง"],"a":"ก","explain":"อธิบาย"},{"q":"คำถาม 2?","choices":["ก","ข","ค","ง"],"a":"ข","explain":"อธิบาย"}]}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7
          }
        })
      }
    );

    const json = await response.json();
    if (json.error) throw new Error(json.error.message);
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
