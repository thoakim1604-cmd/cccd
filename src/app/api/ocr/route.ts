import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { detail: "Server misconfiguration: API key is missing" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { detail: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type || "image/jpeg",
              },
            },
            {
              text: `Bạn là một trợ lý AI có khả năng đọc và trích xuất thông tin từ thẻ Căn cước công dân Việt Nam (CCCD).
Hãy đọc hình ảnh này và trả về JSON chứa các trường sau (dịch sang tiếng Việt có dấu chuẩn):
- "name": Họ và tên
- "dob": Ngày sinh (định dạng dd/mm/yyyy)
- "address": Nơi thường trú (gộp thành một chuỗi liền mạch, cách nhau bởi dấu phẩy, chữ in hoa chữ cái đầu của mỗi từ)
- "issue_date": Ngày cấp / Có giá trị đến (định dạng dd/mm/yyyy, nếu là thẻ mới hãy lấy 'Ngày cấp' hoặc 'Ngày, tháng, năm')
- "issued_by": Cơ quan cấp (VD: Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội)

Nếu không tìm thấy trường nào, hãy để giá trị là "N/A".
CHỈ TRẢ VỀ CHUỖI JSON, KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI JSON BLOCK (KHÔNG markdown).`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Attempt to parse JSON safely
    let parsedData;
    try {
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Gemini returned invalid JSON format");
    }

    const processingTime = (Date.now() - startTime) / 1000;

    return NextResponse.json({
      success: true,
      data: {
        name: parsedData.name || "N/A",
        dob: parsedData.dob || "N/A",
        address: parsedData.address || "N/A",
        issue_date: parsedData.issue_date || "N/A",
        issued_by: parsedData.issued_by || "N/A",
      },
      ocr_lines: [], // No raw lines available in this mode
      processing_time: parseFloat(processingTime.toFixed(2)),
    });
  } catch (error: any) {
    console.error("Gemini OCR Error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to process image with Gemini API" },
      { status: 500 }
    );
  }
}
