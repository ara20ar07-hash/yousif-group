import { GoogleGenAI } from "@google/genai";

const BLUEPRINT_PROMPT = `You are an expert architectural engineer analyzing a floor plan blueprint. Your job is to read room dimensions and calculate underfloor heating requirements with extreme precision. You must read the ENTIRE floor plan holistically before finalizing any single room's dimensions — misreading one room's wall length is the most common failure mode, and the steps below exist specifically to catch that before it reaches the output.

STEP 0 - ESTABLISH GROUND TRUTH (DO THIS FIRST, BEFORE READING INDIVIDUAL ROOMS):
Locate the OVERALL exterior building dimensions, usually printed along the outside perimeter of the blueprint (e.g. a total width like "12.40m" along the bottom edge, a total length like "9.80m" along the side). Record these as exteriorWidth and exteriorLength. Calculate exteriorFootprintSqm = exteriorWidth x exteriorLength. This is your ground truth constraint that every room reading must be consistent with.

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
For each room, find the dimension numbers printed on or inside its boundary walls. These are usually in meters (e.g. 3.20, 4.60, 2.95). Read both width AND length for every room. Pay close attention to digits that are commonly misread near room labels where text is smudged, small, or partially obscured — a "3" can be misread as "8", a "1" as "7". If a dimension is unclear or missing, state "unreadable" and estimate conservatively (use a smaller value, not larger).

STEP 3 - CALCULATE AREA:
For every room calculate: areaSqm = width x length
Show the formula explicitly, e.g. "3.20m x 4.60m = 14.72 sqm"
Never guess an area without showing the dimensional working.

STEP 4 - CROSS-VALIDATION PASS (MANDATORY — do this before finalizing any output):
1. SHARED WALL CHECK: For any two rooms that share a wall (adjacent in the layout), the shared wall length must match in both rooms' dimensions. If they don't match, re-read both rooms' wall dimension text directly from the image and use whichever value is more clearly legible. Do not average the two numbers — pick the correct one.
2. FOOTPRINT SUM CHECK: Sum all room areaSqm values (interior rooms only). This total will be smaller than exteriorFootprintSqm due to wall thickness — expect it to land roughly 80-92% of exteriorFootprintSqm. If the sum falls outside that range, the largest and smallest rooms are suspect: re-examine their printed dimension digits specifically before finalizing.
3. OUTLIER CHECK: Compare each room's area against other rooms of the same category (all Bedrooms together, all Toilets together, etc). If any single room's area deviates more than 60% from the median of its category, re-verify its dimension digits by looking again at the specific numbers printed in that room's boundary before accepting the value.
4. Only finalize the JSON output after all three checks above have been performed.

STEP 5 - DETERMINE HEATING:
Rooms that get underfloor heating (isHeated = true):
- Bedrooms, Living rooms, Kitchens, Corridors

Rooms excluded from underfloor heating (isHeated = false, loopCount = 0, heatingOutputRequiredKw = 0):
- Bathrooms, Toilets, Bathroom Lobbies, Toilet Lobbies, Lobbies adjacent to toilets/bathrooms, Open shafts, Garages, Storage rooms, Auxiliary kitchens

STEP 6 - CALCULATE LOOPS:
For heated rooms only:
- loopCount = ceil(areaSqm / 12)
- Examples: 10 sqm = 1 loop, 12 sqm = 1 loop, 13 sqm = 2 loops, 24 sqm = 2 loops, 25 sqm = 3 loops
- Minimum 1 loop per heated room

STEP 7 - CALCULATE kW:
- heatingOutputRequiredKw = areaSqm x 0.17 (for heated rooms only, 170 Watts per heated square meter)
- Round to 1 decimal place

OUTPUT RULES:
- totalAreaSqm = sum of ALL heated room areas (where isHeated is true)
- recommendedBoilerKw = (totalAreaSqm x 0.17) x 1.20, minimum 12kW, round up to nearest whole number
- recommendedManifoldPorts = sum of all loopCount values
- estimatedPipeSpacingCm = 15

Respond ONLY with valid raw JSON in this exact structure:
{
  "exteriorWidth": 0,
  "exteriorLength": 0,
  "exteriorFootprintSqm": 0,
  "rooms": [
    {
      "nameEn": "room name in English",
      "nameKu": "room name in Kurdish",
      "areaSqm": 14.72,
      "heatingOutputRequiredKw": 1.5,
      "loopCount": 2,
      "isHeated": true,
      "formula": "3.20m x 4.60m = 14.72 sqm"
    }
  ],
  "totalAreaSqm": 0,
  "recommendedBoilerKw": 0,
  "recommendedManifoldPorts": 0,
  "estimatedPipeSpacingCm": 15,
  "validationNotes": "list any rooms that were re-checked during cross-validation and why, or state 'No inconsistencies detected' if the initial read passed all checks",
  "calculatedSummaryEn": "detailed engineering summary",
  "calculatedSummaryKu": "پوختەی ئەندازیاری"
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