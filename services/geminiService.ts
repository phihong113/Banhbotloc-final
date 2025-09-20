import { GoogleGenAI } from "@google/genai";
import type { Product } from '../types';

// Helper function to get the AI client only when needed.
// This prevents the app from crashing on start if the API key is not set.
const getAiClient = (): GoogleGenAI | null => {
    if (!process.env.API_KEY) {
        console.warn("Biến môi trường API_KEY chưa được đặt. Các tính năng AI sẽ không khả dụng.");
        return null;
    }
    // Add a try-catch block here for extra safety during initialization
    try {
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (error) {
        console.error("Lỗi khi khởi tạo GoogleGenAI client:", error);
        return null;
    }
}

export const generateDescription = async (itemName: string, category: string, keywords: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return "Tính năng AI chưa được cấu hình. Vui lòng kiểm tra lại API Key.";
    }

    const prompt = `Tạo một mô tả sản phẩm hấp dẫn và ngắn gọn cho một mặt hàng.
    - Tên sản phẩm: ${itemName}
    - Danh mục: ${category}
    - Từ khóa: ${keywords}
    
    Mô tả phải chuyên nghiệp, hấp dẫn và phù hợp để đăng bán trên trang thương mại điện tử. Không bao gồm tên sản phẩm hoặc danh mục trong phần mô tả. Chỉ viết nội dung mô tả.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 150,
                thinkingConfig: { thinkingBudget: 50 },
            }
        });
        // FIX: The response.text property can be null, which would cause an error when calling trim(). Added a null check to ensure the function returns an empty string if the response text is null or undefined.
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Lỗi khi tạo mô tả:", error);
        return "Đã xảy ra lỗi khi tạo mô tả. Vui lòng kiểm tra console log.";
    }
};

export const getRestockSuggestions = async (lowStockItems: Product[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return "Tính năng AI chưa được cấu hình. Vui lòng kiểm tra lại API Key.";
    }

    if (lowStockItems.length === 0) {
        return "Không có mặt hàng nào sắp hết hàng để đưa ra gợi ý.";
    }

    const itemsList = lowStockItems
        .map(item => `- ${item.name} (Số lượng còn lại: ${item.quantity}, Giá: ${item.priceRaw} VNĐ)`)
        .join('\n');
    
    const prompt = `Với vai trò là một chuyên gia quản lý kho, hãy phân tích danh sách các mặt hàng sắp hết hàng sau đây và đưa ra gợi ý về việc nên ưu tiên nhập lại những mặt hàng nào.
    
    Danh sách mặt hàng sắp hết hàng:
    ${itemsList}
    
    Hãy đưa ra một bản tóm tắt ngắn gọn (khoảng 2-3 câu), chuyên nghiệp. Chỉ tập trung vào các đề xuất chính. Ví dụ: "Ưu tiên nhập hàng cho [Tên sản phẩm A] vì giá trị cao và [Tên sản phẩm B] vì có thể bán chạy."`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                maxOutputTokens: 200,
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        // FIX: The response.text property can be null, which would cause an error when calling trim(). Added a null check to ensure the function returns an empty string if the response text is null or undefined.
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Lỗi khi tạo gợi ý nhập hàng:", error);
        return "Đã xảy ra lỗi khi tạo gợi ý nhập hàng. Vui lòng kiểm tra console log.";
    }
};