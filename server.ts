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

CRITICAL MANDATES & ROOM SEPARATION:
- Extract all distinct living spaces, distinct bedrooms, and key functional zones.
- DRESSING ROOMS & WALK-IN CLOSETS: If a Dressing Room ("جلگۆڕین" / "مەلبەس" / "Dressing" / "Closet" / "Walk-in Closet") is attached to or part of a Bedroom suite, COMBINE it directly into that Bedroom object (e.g. "Master Bedroom + Dressing" / "ژووری نووستنی سەرەکی + جلگۆڕین" or "Bedroom 1 + Dressing" / "ژووری نووستنی ١ + جلگۆڕین") and calculate the combined total area (Bedroom area + Dressing area). Do NOT leave dressing rooms as separate detached objects.
- Distinct separate spaces like "Main Kitchen", "Auxiliary Kitchen", "Guest Room", "Living Room", "Dining Room", "Corridor / Hallway" MUST be separate objects.

STEP 1 - READ ROOM LABELS:
Identify every room by its label written inside the room boundary. Labels may be in Kurdish (Sorani), Arabic, or English. Common labels:
- "نوستن" / "ژووری نووستن" = Bedroom (e.g. Bedroom 1, Bedroom 2, Master Bedroom)
- "جلگۆڕین" / "مەلبەس" / "Dressing" = Dressing Room / Closet (Merge into the corresponding attached bedroom suite)
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
- heatingOutputRequiredKw = areaSqm x 0.15 (for heated rooms only, 150 Watts per heated square meter)
- Round to 1 decimal place

STEP 7 - ESTIMATE ROOM LOCATION (BOX):
For each room, estimate its approximate bounding box percentages (0-100 scale) on the floor plan image:
- x: percentage from left edge (0-100)
- y: percentage from top edge (0-100)
- width: room width percentage relative to image (0-100)
- height: room height percentage relative to image (0-100)

OUTPUT RULES:
- totalAreaSqm = sum of ALL heated room areas (where isHeated is true)
- recommendedBoilerKw = Nearest standard capacity from [9, 12, 16, 20, 32, 55] kW matching (totalAreaSqm x 0.15)
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
    const modelsToTry = [
      "gemini-3.7-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting blueprint analysis with model ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
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
          ],
          config: {
            responseMimeType: "application/json"
          }
        });

        const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          console.log(`Blueprint analysis successfully generated by ${modelName}.`);
          return text;
        }
        geminiErrors.push(`${modelName}: Returned empty response`);
      } catch (err: any) {
        const errDetail = `[${modelName}] Code: ${err?.status || err?.code || 'N/A'}, Message: ${err?.message || String(err)}`;
        console.warn(`Model ${modelName} failed:`, errDetail);
        geminiErrors.push(errDetail);
      }
    }

    const detailedErrStr = `All Gemini models failed:\n- ${geminiErrors.join("\n- ")}`;
    const failureErr = new Error(detailedErrStr);
    (failureErr as any).details = geminiErrors;
    throw failureErr;
  };

  const analyzeWithGroq = async (cleanBase64: string, apiKey: string) => {
    const groq = new Groq({ apiKey });
    const groqModels = [
      "llama-3.2-11b-vision-preview",
      "llama-3.2-90b-vision-preview"
    ];

    let lastGroqErr: any = null;

    for (const model of groqModels) {
      try {
        console.log(`Attempting Groq vision analysis with model ${model}...`);
        const response = await groq.chat.completions.create({
          model,
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
          max_tokens: 2500
        });

        const contentText = response.choices?.[0]?.message?.content || "";
        if (contentText.trim().length > 0) {
          return contentText;
        }
      } catch (err: any) {
        console.warn(`Groq model ${model} failed:`, err?.message || err);
        lastGroqErr = err;
      }
    }

    throw lastGroqErr || new Error("Groq vision analysis failed.");
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
      const availableGeminiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2]
        .filter(k => typeof k === "string" && k.trim().length > 0) as string[];
      const groqKey = process.env.GROQ_API_KEY;

      if (availableGeminiKeys.length === 0 && !groqKey) {
        throw new Error("No API key configured. Please configure GEMINI_API_KEY in the Settings > Secrets panel.");
      }

      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 data provided." });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      let rawText = "";
      let usedFallback = false;
      let lastGeminiError: any = null;

      // Try each available Gemini API key
      if (availableGeminiKeys.length > 0) {
        for (const geminiKey of availableGeminiKeys) {
          try {
            rawText = await analyzeWithGemini(cleanBase64, geminiKey);
            break;
          } catch (geminiErr: any) {
            lastGeminiError = geminiErr;
            console.warn("Gemini key attempt failed, checking fallback...");
          }
        }
      }

      // If Gemini did not produce rawText, try Groq fallback if configured
      if (!rawText && groqKey && groqKey.trim().length > 0) {
        try {
          console.log("Trying Groq fallback...");
          rawText = await analyzeWithGroq(cleanBase64, groqKey);
          usedFallback = true;
          console.log("Groq fallback succeeded.");
        } catch (groqErr: any) {
          console.warn("Groq fallback also failed:", groqErr?.message || groqErr);
          const combinedMsg = lastGeminiError 
            ? `Gemini Error:\n${lastGeminiError.message}\n\nGroq Error:\n${groqErr.message || String(groqErr)}`
            : groqErr.message || String(groqErr);
          throw new Error(combinedMsg);
        }
      }

      if (!rawText) {
        if (lastGeminiError) {
          throw lastGeminiError;
        }
        throw new Error("AI analysis did not return a response.");
      }

      const parsedData = parseJsonResponse(rawText);

      if (usedFallback) {
        parsedData._notice = "Analyzed using Groq fallback.";
      }

      res.json(parsedData);

    } catch (err: any) {
      console.error("AI Blueprint Analysis failed:", err);
      let errorMsg = err.message || "Blueprint AI visual scanner failed.";
      let isPermissionDenied = false;
      const errorStr = (String(err) + " " + String(err.message || "")).toLowerCase();

      if (
        errorStr.includes("401") ||
        errorStr.includes("invalid_api_key") ||
        errorStr.includes("api key not valid") ||
        errorStr.includes("api_key")
      ) {
        isPermissionDenied = true;
        errorMsg = "Your API key is invalid (401). Please check Settings > Secrets to ensure a valid API key is configured.";
      } else if (
        errorStr.includes("403") ||
        errorStr.includes("permission_denied") ||
        errorStr.includes("access denied")
      ) {
        isPermissionDenied = true;
        errorMsg = "API access denied (403). Please verify your Google AI Studio / Gemini API key permissions in Google Cloud Console.";
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