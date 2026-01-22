import { GoogleGenAI } from "@google/genai";

export const parseReceiptWithAI = async (base64Image: string): Promise<{amount: number, label: string}[]> => {
  const apiKey = process.env.API_KEY;
  
  // Kiểm tra xem mã có tồn tại không
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("LỖI CẤU HÌNH: Web chưa nhận được mã API từ GitHub. Anh Đại hãy nhấn 'Commit' lại code này để GitHub chạy lại bản mới nhé!");
  }

  // Kiểm tra định dạng mã
  if (!apiKey.startsWith("AIza")) {
    throw new Error(`MÃ KHÔNG HỢP LỆ: Mã anh dán đang bắt đầu bằng "${apiKey.substring(0, 4)}...". Anh hãy kiểm tra xem có dán nhầm ID dự án không?`);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Bạn là trợ lý tính tiền cho quán nhậu. 
  Quét ảnh hóa đơn/bill này và tìm các số tiền (giá món). 
  Trả về JSON: [{"amount": 50000, "label": "Món ăn"}]. 
  Chỉ trả về JSON.`;

  try {
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text;
    if (!textOutput) return [];

    const result = JSON.parse(textOutput);
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error("Lỗi AI:", error);
    
    // Báo lỗi chi tiết từ Google
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("not valid")) {
      throw new Error(`GOOGLE TỪ CHỐI MÃ: Mã "${apiKey.substring(0, 5)}...${apiKey.slice(-3)}" bị báo là sai. Anh kiểm tra xem có copy thừa dấu cách ở đầu/cuối không?`);
    }
    
    throw new Error("Mạng yếu hoặc Google đang bận, anh bấm nút chụp lại phát nữa nhé!");
  }
};
