import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const BLUEPRINT_PROMPT = `...`; // copy exact prompt from your server.ts

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "No API key configured." });

    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided." });

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: BLUEPRINT_PROMPT }
        ]
      }]
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    res.json(JSON.parse(clean));

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
