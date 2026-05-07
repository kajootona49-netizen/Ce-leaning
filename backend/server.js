const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// แก้ไขจุดนี้: ระบุ apiVersion เป็น "v1" (Stable) เพื่อป้องกัน Error 404
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1" });

app.get("/", (req, res) => {
  res.json({ status: "CE Learning API is running 🚀" });
});

app.post("/api/chapter", async (req, res) => {
  const { subjectName, chapterTitle } = req.body;
  if (!subjectName || !chapterTitle) {
    return res.status(400).json({ error: "กรุณาส่ง subjectName และ chapterTitle" });
  }
  try {
    // ใช้ model gemini-1.5-flash ชื่อมาตรฐาน
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `คุณคือครูสอนวิทยาการคอมพิวเตอร์ระดับ ปวช ไทย สร้างบทเรียนสำหรับ:
วิชา: ${subjectName}
บท: ${chapterTitle}

ตอบเป็น JSON เท่านั้น ห้ามมีคำบรรยายอื่นนอกเหนือจาก JSON ห้ามใส่ Markdown code blocks (ห้ามมี backtick):
{"intro":"บทนำ 3-4 ประโยค","sections":[{"title":"หัวข้อ 1","content":"อธิบาย 4-5 ประโยค","code":"โค้ดตัวอย่าง 10-15 บรรทัด","lang":"python หรือ c หรือ sql หรือ html หรือ javascript"},{"title":"หัวข้อ 2","content":"...","code":"...","lang":"..."},{"title":"หัวข้อ 3","content":"...","code":"...","lang":"..."}],"keypoints":["จุด 1","จุด 2","จุด 3","จุด 4"],"quiz":[{"q":"คำถาม?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"},{"q":"คำถาม 2?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"},{"q":"คำถาม 3?","choices":["ก","ข","ค","ง"],"a":"ตัวเลือกที่ถูก","explain":"อธิบาย"}]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();
    
    // คลีน JSON เผื่อ AI ใส่ Markdown มาให้ (ปรับให้รองรับทั้งตัวเล็ก/ใหญ่)
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    const data = JSON.parse(clean);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: "ไม่สามารถสร้างเนื้อหาได้: " + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
