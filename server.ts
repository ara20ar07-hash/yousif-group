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

  const analyzeWithGroq = async (cleanBase64: string, mimeType: string, apiKey: string) => {
    const groq = new Groq({ apiKey });
    const groqModels = [
      "qwen/qwen3.6-27b",
      "qwen/qwen3.8-27b"
    ];

    const groqErrors: string[] = [];

    for (const model of groqModels) {
      // 1. Try with json_object response format
      try {
        console.log(`Attempting Groq vision analysis with model ${model}...`);
        const response = await groq.chat.completions.create({
          model,
          messages: [{
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType || "image/jpeg"};base64,${cleanBase64}` }
              },
              {
                type: "text",
                text: BLUEPRINT_PROMPT
              }
            ]
          }],
          response_format: { type: "json_object" },
          max_tokens: 3500
        });

        const contentText = response.choices?.[0]?.message?.content || "";
        if (contentText.trim().length > 0) {
          console.log(`Groq analysis successfully completed using model ${model}.`);
          return contentText;
        }
        groqErrors.push(`${model}: Empty content returned`);
      } catch (err1: any) {
        console.warn(`Groq model ${model} (json_object) failed:`, err1?.message || err1);
        
        // 2. Retry without response_format if json_object wasn't supported
        try {
          console.log(`Retrying Groq model ${model} without response_format constraint...`);
          const response2 = await groq.chat.completions.create({
            model,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType || "image/jpeg"};base64,${cleanBase64}` }
                },
                {
                  type: "text",
                  text: BLUEPRINT_PROMPT
                }
              ]
            }],
            max_tokens: 3500
          });

          const contentText2 = response2.choices?.[0]?.message?.content || "";
          if (contentText2.trim().length > 0) {
            console.log(`Groq analysis successfully completed on retry with model ${model}.`);
            return contentText2;
          }
        } catch (err2: any) {
          const detail = `[${model}] ${err1?.message || String(err1)}`;
          groqErrors.push(detail);
        }
      }
    }

    throw new Error(`All Groq vision models failed:\n- ${groqErrors.join("\n- ")}`);
  };

  const parseJsonResponse = (rawText: string) => {
    let clean = rawText.trim();
    // Remove thinking tags if reasoning models output them
    clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    if (clean.startsWith("```")) {
      const match = clean.match(/^(?:```(?:json)?\s*)([\s\S]*?)(?:\s*```)$/);
      if (match) clean = match[1].trim();
    }

    try {
      return JSON.parse(clean);
    } catch {
      // Find outermost JSON object
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSubstring = clean.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonSubstring);
      }
      throw new Error("Unable to parse valid architectural JSON from AI model response.");
    }
  };

  app.get("/api/projects-data", (req, res) => {
    res.json(getStoredData());
  });

  app.post("/api/analyze-blueprint", async (req, res) => {
    try {
      const availableGeminiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY2,
        process.env.GEMINI_KEY
      ].filter(k => typeof k === "string" && k.trim().length > 0) as string[];

      const availableGroqKeys = [
        process.env.GROQ_API_KEY,
        process.env.GROQ_KEY,
        process.env.GROQ_API_KEY2,
        process.env.GROQ_TOKEN
      ].filter(k => typeof k === "string" && k.trim().length > 0) as string[];

      if (availableGeminiKeys.length === 0 && availableGroqKeys.length === 0) {
        throw new Error("No API key configured. Please configure GEMINI_API_KEY or GROQ_API_KEY in the Settings > Secrets panel.");
      }

      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 data provided." });
      }

      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const detectedMimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      let rawText = "";
      let usedFallback = false;
      let lastGeminiError: any = null;

      // 1. Try available Gemini API keys first
      if (availableGeminiKeys.length > 0) {
        for (const geminiKey of availableGeminiKeys) {
          try {
            rawText = await analyzeWithGemini(cleanBase64, geminiKey);
            if (rawText && rawText.trim().length > 0) break;
          } catch (geminiErr: any) {
            lastGeminiError = geminiErr;
            console.warn("Gemini key attempt encountered error, checking alternative keys or Groq fallback...");
          }
        }
      }

      // 2. If Gemini failed or was not configured, try Groq fallback
      if (!rawText && availableGroqKeys.length > 0) {
        for (const groqKey of availableGroqKeys) {
          try {
            console.log("Attempting fallback with Groq Cloud vision engine...");
            rawText = await analyzeWithGroq(cleanBase64, detectedMimeType, groqKey);
            if (rawText && rawText.trim().length > 0) {
              usedFallback = true;
              console.log("Groq fallback analysis succeeded.");
              break;
            }
          } catch (groqErr: any) {
            console.warn("Groq key attempt failed:", groqErr?.message || groqErr);
            const combinedMsg = lastGeminiError 
              ? `Gemini Error:\n${lastGeminiError.message}\n\nGroq Fallback Error:\n${groqErr.message || String(groqErr)}`
              : groqErr.message || String(groqErr);
            lastGeminiError = new Error(combinedMsg);
          }
        }
      }

      if (!rawText) {
        if (lastGeminiError) {
          throw lastGeminiError;
        }
        throw new Error("AI analysis did not return a response from any configured model.");
      }

      const parsedData = parseJsonResponse(rawText);

      if (usedFallback) {
        parsedData._notice = "Analyzed using Groq Vision fallback.";
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