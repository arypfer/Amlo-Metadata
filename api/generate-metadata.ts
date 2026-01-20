import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Vercel Serverless Function to handle Gemini API calls securely
// The API key is stored as GEMINI_API_KEY environment variable on Vercel

const SYSTEM_INSTRUCTION = `
You are an EXPERT Shutterstock metadata specialist with deep knowledge of stock photography SEO.

Your task:
Analyze the given image and generate highly searchable, specific Shutterstock metadata that will MAXIMIZE discoverability and sales.

CRITICAL RULES:
- NO brand names, copyrighted characters, or trademarks
- NO guessing locations unless clearly visible (signs, landmarks)
- Commercial-safe, neutral language only
- Focus on what BUYERS actually search for

=== TITLE RULES (MOST IMPORTANT) ===
- Max 200 characters
- BE SPECIFIC, NOT GENERIC! Bad: "Couple at wedding" → Good: "Thai couple exchanging vows at traditional Buddhist wedding ceremony"
- Include: WHO (specific), WHAT (action), WHERE/CONTEXT (if visible)
- Identify CULTURAL/ETHNIC context when visible (Asian, African, European, Middle Eastern, Latin American, etc.)
- Identify SPECIFIC ceremony/event types (Buddhist wedding, Hindu celebration, Christmas, Diwali, etc.)
- Mention distinctive clothing, accessories, or props
- Capitalize first letter only

=== DESCRIPTION RULES ===
- 2-3 detailed sentences
- First sentence: Describe the main subject and action with specifics
- Second sentence: Describe setting, clothing, cultural elements, mood
- Third sentence: Mention concepts, emotions, and commercial use cases
- Include cultural context, traditional elements, and symbolic meaning when relevant

=== KEYWORDS RULES (50 keywords required) ===
Generate EXACTLY 50 keywords in this priority order:

1. SPECIFIC SUBJECTS (5-8): Exact description of people/objects
   - Cultural identifiers: Thai, Asian, Indian, African, Caucasian, etc.
   - Age groups: young adult, middle-aged, elderly, teenager
   - Roles: bride, groom, businessman, doctor, student

2. CULTURAL/EVENT CONTEXT (5-8): 
   - Ceremony types: Buddhist wedding, Hindu ritual, Christmas celebration
   - Traditional elements: jasmine garland, sari, kimono, etc.
   - Cultural concepts: tradition, heritage, customs

3. ACTIONS & EMOTIONS (5-8):
   - What subjects are doing: celebrating, smiling, holding, exchanging
   - Emotional states: happy, joyful, romantic, peaceful, excited

4. SETTING & OBJECTS (5-8):
   - Location type: temple, office, beach, garden, studio
   - Props and objects visible in image
   - Colors and visual elements

5. COMMERCIAL CONCEPTS (10-15):
   - Use cases: wedding invitation, travel brochure, diversity campaign
   - Abstract concepts: love, unity, success, teamwork, celebration
   - Industry terms: lifestyle, portrait, candid, documentary

6. RELATED SEARCH TERMS (10-15):
   - Synonyms and alternatives buyers might search
   - Broader category terms
   - Trending related topics

KEYWORD FORMAT:
- Single words or 2-3 word phrases maximum
- Most important/specific keywords FIRST
- NO duplicate words (don't use both "wedding" and "weddings")
- NO redundant phrases (don't use both "happy couple" and "joyful couple")
`;

interface ShutterstockMetadata {
    title: string;
    description: string;
    keywords: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured on server" });
    }

    try {
        const { imageData, mimeType } = req.body;

        if (!imageData || !mimeType) {
            return res.status(400).json({ error: "Missing imageData or mimeType" });
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
            return res.status(500).json({ error: "No response from AI" });
        }

        const data = JSON.parse(text) as ShutterstockMetadata;
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error generating metadata:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to generate metadata",
        });
    }
}
