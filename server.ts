import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const storeFilePath = path.join(dataDir, "store.json");

  const getStoredData = () => {
    if (fs.existsSync(storeFilePath)) {
      try {
        const fileContent = fs.readFileSync(storeFilePath, "utf8");
        return JSON.parse(fileContent);
      } catch (err) {
        console.error("Error reading store.json, returning default empty structures", err);
      }
    }
    return {
      customPhotos: {},
      customProjects: {},
      servicesData: null
    };
  };

  const BLUEPRINT_PROMPT = `You are an expert architectural engineer analyzing a floor plan blueprint. Your job is to read room dimensions and calculate underfloor heating requirements with extreme precision.

CRITICAL MANDATE - STRICT ROOM SEPARATION:
- Every single room shown on the floor plan MUST be extracted as an INDIVIDUAL, SEPARATE room object in the "rooms" array.
- NEVER combine or merge multiple rooms together (e.g. if there are 3 bedrooms, return 3 distinct objects: "Bedroom 1", "Bedroom 2", "Bedroom 3" with their own specific width, length, and areaSqm).
- Distinct spaces like "Main Kitchen", "Auxiliary Kitchen", "Guest Room", "Living Room", "Dining Room", "Corridor / Hallway" MUST be separate objects.

STEP 1 - READ ROOM LABELS:
Identify every room by its label written inside the room boundary. Labels may be in Kurdish (Sorani), Arabic, or English. Common labels:
- "نوستن" / "ژووری نووستن" = Bedroom (e.g. Bedroom 1, Bedroom 2, etc.)
- "مەتبەخ" = Main Kitchen
- "مساعد مەتبەخ" = Auxiliary Kitchen
- "هۆڵ" / "هۆڵی دانیشتن" = Living Room / Hall
- "میوان" / "ژووری میوان" = Guest Room
- "کراوە" = Open Shaft / Courtyard
- "توالیت" = Toilet
- "حەمام" = Bathroom
- "گراج" / "گەراج" = Garage
- "کۆگا" = Storage
- "مەمەڕ" / "ڕێڕەو" = Corridor / Hallway

STEP 2 - READ DIMENSIONS:
For each individual room, find the dimension numbers printed on or inside its boundary walls. These are usually in meters (e.g. 3.20, 4.60, 2.95). Read both width AND length for every room. If a dimension is unreadable, estimate conservatively based on adjacent rooms.

STEP 3 - CALCULATE AREA:
For every room calculate: areaSqm = width x length
Show the formula explicitly, e.g. "3.20m x 4.60m = 14.72 sqm"
Never guess an area without showing the dimensional working.

STEP 4 - DETERMINE HEATING:
Rooms that get underfloor heating (isHeated = true):
- Bedrooms, Living rooms, Guest rooms, Main Kitchens, Corridors/Hallways, Dining rooms

Rooms excluded from underfloor heating (isHeated = false, loopCount = 0, heatingOutputRequiredKw = 0):
- Bathrooms, Toilets, Bathroom Lobbies, Toilet Lobbies, Open shafts, Garages, Storage rooms, Auxiliary kitchens

STEP 5 - CALCULATE LOOPS:
For heated rooms only:
- loopCount = ceil(areaSqm / 12)
- Examples: 10 sqm = 1 loop, 12 sqm = 1 loop, 13 sqm = 2 loops, 24 sqm = 2 loops, 25 sqm = 3 loops
- Minimum 1 loop per heated room

STEP 6 - CALCULATE kW:
- heatingOutputRequiredKw = areaSqm x 0.17 (for heated rooms only, 170 Watts per heated square meter)
- Round to 1 decimal place

STEP 7 - ESTIMATE ROOM LOCATION (BOX):
For each room, estimate its approximate bounding box percentages (0-100 scale) on the floor plan image:
- x: percentage from left edge (0-100)
- y: percentage from top edge (0-100)
- width: room width percentage relative to image (0-100)
- height: room height percentage relative to image (0-100)

OUTPUT RULES:
- totalAreaSqm = sum of ALL heated room areas (where isHeated is true)
- recommendedBoilerKw = (totalAreaSqm x 0.17) x 1.20, minimum 12kW, round up to nearest whole number
- recommendedManifoldPorts = sum of all loopCount values
- estimatedPipeSpacingCm = 15

Respond ONLY with valid raw JSON in this exact structure:
{
  "rooms": [
    {
      "nameEn": "Bedroom 1",
      "nameKu": "ژووری نووستنی ١",
      "areaSqm": 14.72,
      "heatingOutputRequiredKw": 2.5,
      "loopCount": 2,
      "isHeated": true,
      "formula": "3.20m x 4.60m = 14.72 sqm",
      "box": { "x": 15, "y": 20, "width": 30, "height": 25 }
    }
  ],
  "totalAreaSqm": 0,
  "recommendedBoilerKw": 0,
  "recommendedManifoldPorts": 0,
  "estimatedPipeSpacingCm": 15,
  "calculatedSummaryEn": "detailed engineering summary",
  "calculatedSummaryKu": "پوختەی ئەندازیاری"
}`;

  const analyzeWithGemini = async (cleanBase64: string, apiKey: string) => {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });

    const geminiErrors: string[] = [];

    // 1. Try Gemini 3.6 Flash first
    try {
      console.log("Attempting blueprint analysis with primary model Gemini 3.6 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              },
              { text: BLUEPRINT_PROMPT }
            ]
          }
        ]
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) return text;
      geminiErrors.push("gemini-3.6-flash: Returned empty or candidate-less response");
    } catch (err1: any) {
      const errDetail1 = `[gemini-3.6-flash] Code: ${err1?.status || err1?.code || 'N/A'}, Message: ${err1?.message || String(err1)}`;
      console.warn("Primary Gemini model failed:", errDetail1);
      geminiErrors.push(errDetail1);
    }

    // 2. Try Gemini 2.5 Flash as secondary Gemini model
    try {
      console.log("Gemini 3.6 Flash failed/unavailable. Retrying with secondary model Gemini 2.5 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              },
              { text: BLUEPRINT_PROMPT }
            ]
          }
        ]
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) return text;
      geminiErrors.push("gemini-2.5-flash: Returned empty response");
    } catch (err2: any) {
      const errDetail2 = `[gemini-2.5-flash] Code: ${err2?.status || err2?.code || 'N/A'}, Message: ${err2?.message || String(err2)}`;
      console.warn("Secondary Gemini model failed:", errDetail2);
      geminiErrors.push(errDetail2);
    }

    // 3. Try Gemini 1.5 Flash as final Gemini fallback
    try {
      console.log("Retrying with Gemini 1.5 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              },
              { text: BLUEPRINT_PROMPT }
            ]
          }
        ]
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) return text;
      geminiErrors.push("gemini-1.5-flash: Returned empty response");
    } catch (err3: any) {
      const errDetail3 = `[gemini-1.5-flash] Code: ${err3?.status || err3?.code || 'N/A'}, Message: ${err3?.message || String(err3)}`;
      console.warn("Final Gemini model failed:", errDetail3);
      geminiErrors.push(errDetail3);
    }

    const detailedErrStr = `All Gemini models failed:\n- ${geminiErrors.join("\n- ")}`;
    const failureErr = new Error(detailedErrStr);
    (failureErr as any).details = geminiErrors;
    throw failureErr;
  };

  const analyzeWithGroq = async (cleanBase64: string, apiKey: string) => {
    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${cleanBase64}` }
          },
          {
            type: "text",
            text: BLUEPRINT_PROMPT
          }
        ]
      }],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const contentText = response.choices?.[0]?.message?.content || "";
    return contentText;
  };

  const parseJsonResponse = (rawText: string) => {
    let clean = rawText.trim();
    if (clean.startsWith("```")) {
      const match = clean.match(/^(?:```(?:json)?\s*)([\s\S]*?)(?:\s*```)$/);
      if (match) clean = match[1].trim();
    }
    return JSON.parse(clean);
  };

  app.get("/api/projects-data", (req, res) => {
    res.json(getStoredData());
  });

  app.post("/api/analyze-blueprint", async (req, res) => {
    try {
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2;
      const groqKey = process.env.GROQ_API_KEY;

      if (!geminiKey && !groqKey) {
        throw new Error("No API key found. Please ensure GEMINI_API_KEY is configured.");
      }

      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 data found" });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      let rawText = "";
      let usedFallback = false;

      // Try Gemini first
      if (geminiKey) {
        try {
          console.log("Attempting blueprint analysis with Gemini 3.6 Flash...");
          rawText = await analyzeWithGemini(cleanBase64, geminiKey);
          console.log("Gemini analysis succeeded.");
        } catch (geminiErr: any) {
          console.warn("Gemini analysis failed:", geminiErr?.message || geminiErr);
          if (groqKey) {
            try {
              console.log("Trying Groq fallback...");
              rawText = await analyzeWithGroq(cleanBase64, groqKey);
              usedFallback = true;
              console.log("Groq fallback succeeded.");
            } catch (groqErr: any) {
              console.warn("Groq fallback also failed:", groqErr?.message || groqErr);
              const combinedErr = new Error(`Gemini Analysis Error:\n${geminiErr.message}\n\nGroq Fallback Error:\n${groqErr.message || String(groqErr)}`);
              throw combinedErr;
            }
          } else {
            throw geminiErr;
          }
        }
      } else if (groqKey) {
        // No Gemini key at all, go straight to Groq
        console.log("No Gemini key found, using Groq directly...");
        rawText = await analyzeWithGroq(cleanBase64, groqKey);
        usedFallback = true;
      }

      const parsedData = parseJsonResponse(rawText);

      if (usedFallback) {
        parsedData._notice = "Analyzed using Groq fallback (Gemini unavailable).";
      }

      res.json(parsedData);

    } catch (err: any) {
      console.error("AI Blueprint Analysis failed:", err);
      let errorMsg = err.message || "Blueprint AI visual scanner failed.";
      let isPermissionDenied = false;
      const errorStr = (String(err) + " " + String(err.message || "")).toLowerCase();

      if (
        errorStr.includes("401") ||
        errorStr.includes("api_key") ||
        errorStr.includes("authentication") ||
        errorStr.includes("unauthorized") ||
        errorStr.includes("invalid_api_key")
      ) {
        isPermissionDenied = true;
        errorMsg = "Your API key is invalid or missing (401). Please check Settings > Secrets and ensure GEMINI_API_KEY2 is set correctly.";
      } else if (
        errorStr.includes("403") ||
        errorStr.includes("permission") ||
        errorStr.includes("denied")
      ) {
        isPermissionDenied = true;
        errorMsg = "Access denied (403). Ensure your Gemini API key has the Gemini API enabled in Google Cloud Console.";
      }

      res.status(500).json({ error: errorMsg, isPermissionDenied });
    }
  });

  app.post("/api/projects-data", (req, res) => {
    try {
      const { customPhotos, customProjects, servicesData } = req.body;
      const dataToSave = {
        customPhotos: customPhotos || {},
        customProjects: customProjects || {},
        servicesData: servicesData || null
      };
      fs.writeFileSync(storeFilePath, JSON.stringify(dataToSave, null, 2), "utf8");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error writing data to store.json:", err);
      res.status(500).json({ error: err.message || "Failed to persist project data" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
  });
}

startServer();