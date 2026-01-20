import { GoogleGenAI, Type } from "@google/genai";
import { ShutterstockMetadata } from "../types";

const SYSTEM_INSTRUCTION = `
You are a professional Shutterstock contributor assistant.

Your task:
Analyze the given image and generate Shutterstock-ready metadata.

RULES (VERY IMPORTANT):
- NO brand names
- NO copyrighted characters
- NO trademarks
- NO location guessing unless clearly visible
- NO camera or technical metadata
- Commercial-safe wording
- Neutral, descriptive, searchable language
- Avoid repetition
- Use simple English
- Focus on concepts buyers search for

OUTPUT FORMAT (STRICT JSON):
{
  "title": "",
  "description": "",
  "keywords": []
}

TITLE RULES:
- Max 200 characters
- Clear and factual
- No marketing language
- Capitalize first letter only

DESCRIPTION RULES:
- 2–3 sentences
- Explain what is visible
- Mention concepts (business, lifestyle, technology, emotion, etc.)
- Neutral, stock-photo style

KEYWORDS RULES:
- 40–50 keywords
- Comma separated (in the JSON array)
- Single words or short phrases
- Most important keywords first
- Include: Subject, Action, Concept, Emotion, Usage context
- Do NOT repeat same word excessively
- NO plurals + singular duplicates
`;

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateMetadata = async (imageFile: File): Promise<ShutterstockMetadata> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare image
    const imagePart = await fileToGenerativePart(imageFile);

    // Prepare Schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A clear, factual title max 200 chars. Capitalize first letter only."
        },
        description: {
          type: Type.STRING,
          description: "2-3 sentences explaining visual content and concepts. Neutral style."
        },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "40-50 keywords, most important first, no brands/trademarks."
        }
      },
      required: ["title", "description", "keywords"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [imagePart, { text: "Analyze this image and generate metadata." }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as ShutterstockMetadata;
    return data;

  } catch (error) {
    console.error("Error generating metadata:", error);
    throw error;
  }
};