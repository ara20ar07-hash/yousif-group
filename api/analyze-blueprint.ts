import { GoogleGenAI } from "@google/genai";

const BLUEPRINT_PROMPT = `You are an expert architectural engineer analyzing a floor plan blueprint. Your job is to read room dimensions and calculate underfloor heating requirements with extreme precision.

STEP 1 - READ ROOM LABELS:
Identify every room by its label written inside the room boundary. Labels may be in Kurdish (Sorani), Arabic, or English. Common labels:
- "نوستن" / "ژووری نووستن" = Bedroom
- "مەتبەخ" = Main Kitchen
- "مساعد مەتبەخ" = Auxiliary Kitchen
- "هۆڵ" / "هۆڵی دانیشتن" = Living Room / Hall
- "کراوە" = Open Shaft / Courtyard
- "توالیت" = Toilet
- "حەمام" = Bathroom
- "گراج" / "گەراج" = Garage
- "کۆگا" = Storage
- "مەمەڕ" / "ڕێڕەو" = Corridor

STEP 2 - READ DIMENSIONS:
For each room, find the dimension numbers printed on or inside its boundary walls. These are usually in meters (e.g. 3.20, 4.60, 2.95). Read both width AND length for every room.

STEP 3 - CALCULATE AREA:
areaSqm = width x length

STEP 4 - DETERMINE HEATING:
Heated rooms (isHeated = true): Bedrooms, Living rooms, Kitchens, Corridors
Excluded (isHeated = false, loopCount = 0, heatingOutputRequiredKw = 0): Bathrooms, Toilets, Open shafts, Garages, Storage, Auxiliary kitchens

STEP 5 - CALCULATE LOOPS:
loopCount = ceil(areaSqm / 12), minimum 1 per heated room

STEP 6 - CALCULATE kW:
heatingOutputRequiredKw = areaSqm x 0.10 (heated rooms only)

OUTPUT RULES:
- recommendedBoilerKw = sum of heatingOutputRequiredKw x 1.20, minimum 12kW
- recommendedManifoldPorts = sum of all loopCounts
- estimatedPipeSpacingCm = 15
- totalAreaSqm = sum of ALL rooms

Respond ONLY with valid raw JSON:
{
  "rooms": [
    {
      "nameEn": "string",
      "nameKu": "string",
      "areaSqm": 0,
      "heatingOutputRequiredKw": 0,
      "loopCount": 0,
      "isHeated": true,
      "formula": "3.20m x 4.60m = 14.72 sqm"
    }
  ],
  "totalAreaSqm": 0,
  "recommendedBoilerKw": 0,
  "recommendedManifoldPorts": 0,
  "estimatedPipeSpacingCm": 15,
  "calculatedSummaryEn": "string",
  "calculatedSummaryKu": "string"
}`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No API key configured." }), { status: 500 });
    }

    const body = await req.json();
    const { imageBase64 } = body;
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided." }), { status: 400 });
    }

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

    return new Response(clean, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export const config = { runtime: "edge" };
