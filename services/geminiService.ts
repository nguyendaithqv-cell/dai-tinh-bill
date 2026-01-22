
import { GoogleGenAI } from "@google/genai";

export const parseReceiptWithAI = async (base64Image: string): Promise<{amount: number, label: string}[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Phân tích hình ảnh hóa đơn hoặc danh sách món ăn viết tay này.
    Trích xuất tất cả các giá tiền lẻ của từng món.
    Trả về kết quả dưới dạng JSON mảng các đối tượng: [{"amount": number, "label": string}].
    Lưu ý: "amount" phải là số (không có dấu phẩy/chấm), "label" là tên món (nếu thấy).
    Nếu chỉ có số, hãy để label là "Món lẻ".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "[]");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
