const express = require("express");
const { OpenAI } = require("openai");

const router = express.Router();

// Check if OPENAI_KEY is set
if (!process.env.OPENAI_KEY) {
  console.error("⚠️ OPENAI_KEY not set in .env");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Enhanced system prompt for maintenance technician with detailed technical knowledge
const SYSTEM_PROMPT = `Bạn là một trợ lý AI chuyên gia về bảo trì thiết bị công nghiệp dành cho kỹ thuật viên sửa chữa.

=== KIẾN THỨC CHUYÊN MÔN ===

📌 MÁY HVAC (Điều hòa không khí công nghiệp):
- Kiểm tra định kỳ: Thay dầu/dầu nhớt, vệ sinh lọc không khí, kiểm tra áp suất lạnh
- Bảo trì: Chuốt vòng bi, thay dây curoa, kiểm tra quạt
- Sửa chữa lỗi thường gặp: Không lạnh, rò rỉ dầu, tiếng ồn bất thường, tắc đường ống
- Mô-men xiết chuẩn: M8=20Nm, M10=30Nm, M12=50Nm, M16=100Nm
- Nhiệt độ hoạt động bình thường: 40-50°C, cảnh báo khi >60°C

📌 MÁY NÉN KHÍ:
- Thông số: Áp suất làm việc 8-10 bar, dòng chảy 100-200 CFM tùy model
- Bảo trì: Thay lọc dầu/không khí, kiểm tra dầu nhớt, xả khí
- Lỗi thường gặp: Áp suất yếu, thoát khí từ an toàn, nghe tiếng ồn bất thường
- Sửa chữa: Kiểm tra van, thay thớm, kiểm tra đường ống rò rỉ

📌 MÁY BƠM (Pump):
- Thông số: Dòng chảy 50-500 GPM, áp lực 20-200 PSI tùy loại
- Bảo trì định kỳ: Kiểm tra vòng bi, thay dầu, kiểm tra lò xo
- Phân tích rung động: Rung <2mm/s là bình thường, >5mm/s cần sửa
- Nguyên nhân rò rỉ: Hư vòng bi, thớm hỏng, lò xo yếu
- Sửa chữa: Kiểm tra áp lực, thay vòng biên, kiểm tra lò xo

📌 MÔ-MEN XIẾT CÓ CỬA (Torque Specs ISO 898):
M6: 10Nm | M8: 20Nm | M10: 30Nm | M12: 50Nm | M16: 100Nm | M20: 150Nm | M24: 200Nm

📌 PHÂN TÍCH RUNG ĐỘNG & NHIỆT ĐỘ:
- Rung độ bình thường: 0-1 mm/s (tốt)
- Cảnh báo: 1-5 mm/s (kiểm tra sớm)
- Nguy hiểm: >5 mm/s (dừng ngay, sửa khẩn cấp)
- Nguyên nhân: Mất cân bằng, hỏng vòng bi, lỏng lẻo, xô đặc tính

📌 QUY TRÌNH KIỂM TRA ĐỊNH KỲ (PdM):
1. Kiểm tra vật lý: Kiểm tra rò rỉ, nứt, biến dạng
2. Đo nhiệt độ: Dùng nhiệt kế hồng ngoại
3. Đo rung động: Dùng máy đo rung
4. Kiểm tra dầu: Kiểm tra mức, màu sắc, chất lượng
5. Kiểm tra âm thanh: Nghe các tiếng lạ

📌 SỬA CHỮA KHẨN CẤP:
- Nếu có dấu hiệu nguy hiểm (rung quá, nhiệt độ cao, rò rỉ dầu): Dừng ngay
- Kiểm tra an toàn: Cắt điện, chờ nguội lạnh
- Kiểm tra lỗi: Kiểm tra vòng bi, lò xo, bộ cân bằng
- Sửa chữa: Thay phụ tùng hỏng, tái cân bằng, kiểm tra lại

=== HƯỚNG DẪN TRỰC TIẾP ===
- Trả lời ngắn gọn, rõ ràng, có thể áp dụng ngay
- Nếu được hỏi về một phiếu công việc cụ thể, hãy dùng ngữ cảnh đó
- Luôn đưa ra các bước thực hiện cụ thể
- Cảnh báo về an toàn nếu cần
- Nếu không chắc, hãy đề xuất liên hệ nhà sản xuất hoặc chuyên gia

Hãy trả lời bằng tiếng Việt, chuyên nghiệp và thực tế.`;

// POST /api/assistant/ask
router.post("/ask", async (req, res) => {
  console.log("[assistant] POST /ask payload:", req.body);
  
  const { question, ticketContext } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ message: "question (string) là bắt buộc" });
  }

  // Check if API key is configured
  if (!process.env.OPENAI_KEY) {
    return res.status(500).json({
      message: "❌ Lỗi cấu hình: OPENAI_KEY chưa được set trong .env",
      hint: "Vui lòng thêm OPENAI_KEY=sk-... vào file .env và khởi động lại server"
    });
  }

  try {
    // Include ticket context if available
    let userMessage = question;
    if (ticketContext) {
      userMessage = `【Ngữ cảnh phiếu công việc】\n${ticketContext}\n\n【Câu hỏi】\n${question}`;
    }

    console.log("[assistant] Calling OpenAI with model: gpt-4o-mini");
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const answer = response.choices[0]?.message?.content || "Không có phản hồi từ AI";

    console.log("[assistant] OpenAI Response:", answer.substring(0, 100) + "...");
    res.json({ answer });
  } catch (err) {
    console.error("[assistant] OpenAI error:", err.message);
    
    let msg = "Lỗi kết nối với AI";
    
    if (err.code === "401" || err.message?.includes("401")) {
      msg = "❌ Lỗi xác thực: OPENAI_KEY không hợp lệ. Kiểm tra lại key trong .env";
    } else if (err.code === "429" || err.message?.includes("429")) {
      msg = "❌ Vượt quá giới hạn rate limit. Vui lòng thử lại sau vài giây";
    } else if (err.code === "500" || err.message?.includes("500")) {
      msg = "❌ Lỗi OpenAI server. Vui lòng thử lại sau";
    } else if (err.message?.includes("ECONNREFUSED")) {
      msg = "❌ Không thể kết nối tới OpenAI API. Kiểm tra kết nối internet";
    }
    
    res.status(500).json({
      message: msg,
      error: err.message,
      hint: "Nếu vấn đề vẫn tiếp tục, kiểm tra OPENAI_KEY và kết nối internet"
    });
  }
});

module.exports = router;
