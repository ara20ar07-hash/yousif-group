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
For each room, find the dimension numbers printed on or inside its boundary walls. These are usually in meters (e.g. 3.20, 4.60, 2.95). Read both width AND length for every room. If a dimension is unclear or missing, state "unreadable" and estimate conservatively (use a smaller value, not larger).

STEP 3 - CALCULATE AREA:
For every room calculate: areaSqm = width x length
Show the formula explicitly, e.g. "3.20m x 4.60m = 14.72 sqm"
Never guess an area without showing the dimensional working.

STEP 4 - DETERMINE HEATING:
Rooms that get underfloor heating (isHeated = true):
- Bedrooms, Living rooms, Kitchens, Corridors

Rooms excluded from underfloor heating (isHeated = false, loopCount = 0, heatingOutputRequiredKw = 0):
- Bathrooms, Toilets, Open shafts, Garages, Storage rooms, Auxiliary kitchens

STEP 5 - CALCULATE LOOPS:
For heated rooms only:
- loopCount = ceil(areaSqm / 12)
- Examples: 10 sqm = 1 loop, 12 sqm = 1 loop, 13 sqm = 2 loops, 24 sqm = 2 loops, 25 sqm = 3 loops
- Minimum 1 loop per heated room

STEP 6 - CALCULATE kW:
- heatingOutputRequiredKw = areaSqm x 0.10 (for heated rooms only)
- Round to 1 decimal place

OUTPUT RULES:
- recommendedBoilerKw = (sum of all heatingOutputRequiredKw) x 1.20, minimum 12kW, round up to nearest whole number
- recommendedManifoldPorts = sum of all loopCount values
- estimatedPipeSpacingCm = 15
- totalAreaSqm = sum of ALL heated room areas (where isHeated is true)

Respond ONLY with valid raw JSON in this exact structure:
{
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    const contentText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return contentText;
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
      const geminiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;

      if (!geminiKey && !groqKey) {
        throw new Error("No API key found. Please add GEMINI_API_KEY2 or GROQ_API_KEY in Settings > Secrets.");
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
          console.log("Attempting blueprint analysis with Gemini 3.5 Flash...");
          rawText = await analyzeWithGemini(cleanBase64, geminiKey);
          console.log("Gemini analysis succeeded.");
        } catch (geminiErr: any) {
          console.warn("Gemini failed, trying Groq fallback:", geminiErr.message);
          if (groqKey) {
            rawText = await analyzeWithGroq(cleanBase64, groqKey);
            usedFallback = true;
            console.log("Groq fallback succeeded.");
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