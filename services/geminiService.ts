
import { GoogleGenAI } from "@google/genai";

export const parseReceiptWithAI = async (base64Image: string): Promise<{amount: number, label: string}[]> => {
  // Kiểm tra xem API_KEY có tồn tại không
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("CHƯA CÓ API KEY: Anh Đại hãy vào Settings > Secrets của GitHub để dán mã vào nhé!");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Bạn là một trợ lý tính tiền quán nhậu. Hãy nhìn vào hình ảnh hóa đơn hoặc danh sách món ăn viết tay này.
    Nhiệm vụ: Trích xuất các số tiền của từng món ăn/đồ uống.
    
    Yêu cầu:
    1. Trả về đúng định dạng JSON là một mảng các đối tượng: [{"amount": số_tiền, "label": "tên_món"}].
    2. "amount" phải là con số nguyên (ví dụ: 20000, không được để chữ hay dấu phẩy).
    3. Nếu không đọc được tên món, hãy để label là "Món lẻ".
    4. Chỉ trả về JSON, không giải thích gì thêm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: 'image/jpeg', 
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image 
            } 
          },
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
    // Trả về lỗi chi tiết hơn để hiển thị lên màn hình
    if (error.message?.includes("API key not valid")) {
      throw new Error("Mã API_KEY của anh không đúng hoặc đã hết hạn!");
    }
    throw error;
  }
};
