import { GoogleGenAI, Type } from "@google/genai";

// Vercel Serverless Function to handle Gemini API calls securely
// The API key is stored as GEMINI_API_KEY environment variable on Vercel

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

interface RequestBody {
    imageData: string; // base64 encoded image
    mimeType: string;
}

interface ShutterstockMetadata {
    title: string;
    description: string;
    keywords: string[];
}

export default async function handler(
    req: { method: string; body: RequestBody },
    res: {
        status: (code: number) => {
            json: (data: unknown) => void;
            end: () => void;
        };
        setHeader: (key: string, value: string) => void;
    }
) {
    // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "API key not configured on server" });
        return;
    }

    try {
        const { imageData, mimeType } = req.body;

        if (!imageData || !mimeType) {
            res.status(400).json({ error: "Missing imageData or mimeType" });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        const imagePart = {
            inlineData: {
                data: imageData,
                mimeType: mimeType,
            },
        };

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: "A clear, factual title max 200 chars. Capitalize first letter only.",
                },
                description: {
                    type: Type.STRING,
                    description: "2-3 sentences explaining visual content and concepts. Neutral style.",
                },
                keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "40-50 keywords, most important first, no brands/trademarks.",
                },
            },
            required: ["title", "description", "keywords"],
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: {
                parts: [imagePart, { text: "Analyze this image and generate metadata." }],
            },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const text = response.text;
        if (!text) {
            res.status(500).json({ error: "No response from AI" });
            return;
        }

        const data = JSON.parse(text) as ShutterstockMetadata;
        res.status(200).json(data);
    } catch (error) {
        console.error("Error generating metadata:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to generate metadata",
        });
    }
}
