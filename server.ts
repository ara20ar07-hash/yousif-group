import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Custom large limits for base64 image uploads
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // Create persistent data store path
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const storeFilePath = path.join(dataDir, "store.json");

  // Retrieve stored data with robust defaults
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

  // API Endpoints
  app.get("/api/projects-data", (req, res) => {
    res.json(getStoredData());
  });

  app.post("/api/analyze-blueprint", async (req, res) => {
    try {
      const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GROQ_API_KEY or GEMINI_API_KEY environment variable is required in secrets");
      }
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 data found" });
      }

      // Remove prefix if exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

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
              text: `Analyze this architectural floor plan or house blueprint image with extreme precision and calculate the underfloor heating layout.
This image represents a real residential or commercial blueprint layout. Please examine it carefully, identifying all written text, markers, dimensions, stamps, and room boundaries.

Particularly identify and parse:
1. Kurdish and Arabic room labels written directly in the rooms, such as:
   - "نوستن" / "ژووری نووستن" (Bedrooms / Sleeping Rooms)
   - "مەتبەخ" / "مه تبه خ" (Kitchen)
   - "هۆڵ" / "هۆڵی دانیشتن" (Living Hall / Salon)
   - "کراوە" (Open Shaft / Lightwell / Balcony / Courtyard)
   - "کۆگا" (Storage)
   - "مەمەڕ" / "ڕێڕەو" (Corridor / Hallway)

CRITICAL EXCLUSIONS (Do NOT calculate or place under-floor heating in these rooms):
You MUST completely EXCLUDE the following spaces from having underfloor heating placed or counted as heated under any circumstances:
- "مساعد مەتبەخ" / "چێشتخانەی یاریدەدەر" (Auxiliary / Wet Kitchen)
- "توالیت" (Toilet)
- "حەمام" / "حەمام و توالیت" (Bathroom / Shower room)
- "گراج" / "گەراج" (Garage)
- "کراوە" (Open Shaft / Lightwell / Balcony / Courtyard / Balconies / Shafts)

We do NOT place underfloor heating in these rooms. They MUST have "isHeated": false in the JSON, and their "loopCount" and "heatingOutputRequiredKw" must be set to 0.

2. Read the written metrics, dimension strings, and measurements with extreme accuracy using the following strict rules:
   - CRITICAL ROOM CLASSIFICATION (BATHROOM vs BEDROOM): Look extremely carefully at the icons and plumbing layout inside each room. Bathrooms have distinctive fixtures such as toilets, washbasins (sinks), bathtubs, or walk-in showers. Under no circumstances should you classify or mix up a bathroom/toilet/shower room as a Bedroom. Bedrooms usually feature bed shapes, wardrobes, or clear sleep-related markings.
   - You MUST read numbers printed INSIDE the room boundary first to identify dimensions.
   - If there is no number printed inside, read the dimension lines and measurements on the boundary/wall edges.
   - Specify and distinguish similar rooms (such as multiple bedrooms, e.g. Bedroom (Back Left, 13.44 m²) vs Bedroom (Back Right, 12.60 m²)) by including their precise sizes and positions directly within their English and Kurdish names (e.g. "Bedroom (Back Left, 13.44 m²)" or "ژووری نووستن (دواوە دەستەچەپ، ١٣.٤٤ م²)").
   - Read the length and width with extreme care for each room to make sure you have the exact measurements. Double-check all measurements to avoid any incorrect matching.
   - Never invent or hallucinate a dimension that isn't visible/legible in the image.
   - If a dimension is missing or unreadable, explicitly state so in your detailed engineering summary and estimate conservatively (bias towards smaller dimensions, not larger).
 
3. Use those measurements to calculate the exact area in square meters (sqm) for each space using the strict formula: Area = width * length.
   - You MUST show your working calculation in the format "width x length = area" for every single room (set this in the "formula" field of the room object, and ensure that all output areas "areaSqm" match the shown working calculation exactly). For example, "3.2m x 4.2m = 13.44 sqm".
 
Then output the calculated blueprint analytics strictly matching the following JSON response schema:
{
  "rooms": [
    {
      "nameEn": "Room name with distinct location/size detail (e.g. 'Bedroom 1 (Back Left - 13.44m²)')",
      "nameKu": "Room name in Kurdish with distinct location/size detail (e.g. 'ژووری نووستن (دواوە دەستەچەپ - ١٣.٤٤ م²)')",
      "isHeated": true, // set to false for auxiliary kitchens, bathrooms, toilets, garages, and open shafts
      "widthMeters": 4.6, // number, null if missing
      "lengthMeters": 6.0, // number, null if missing
      "formula": "4.6m x 6.0m = 27.60 sqm", // exactly showing width x length = area
      "areaSqm": 27.6, // number
      "heatingOutputRequiredKw": 2.8, // number, 0 if isHeated is false (approx areaSqm * 0.1 for heated room)
      "loopCount": 2, // number of loops (standard loop covers 15-20 sqm. <15 sqm is 1 loop. 15-30 sqm is 2 loops. 0 if isHeated is false)
      "box": {
        "x": 35, // integer percentage (0-100) representing left position of this room overlay on the blueprint image
        "y": 35, // integer percentage (0-100) representing top position of this room overlay
        "width": 30, // integer percentage (0-100) representing width of this room overlay
        "height": 40 // integer percentage (0-100) representing height of this room overlay
      }
    }
  ],
  "totalAreaSqm": sum of all HEATED room areas only (number),
  "recommendedBoilerKw": calculated total boiler capacity in kW (sum of heated room outputs + 20% safety margin, minimum 12kW),
  "recommendedManifoldPorts": total number of manifold ports (equal to the sum of all heated rooms' loop counts),
  "estimatedPipeSpacingCm": typical spacing distance recommended in cm (usually 15cm for living spaces, and never place or estimate any spacing for excluded spaces),
  "calculatedSummaryEn": "An explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in English based strictly on the heated rooms. Mention explicitly that bathrooms, toilets, auxiliary kitchens, garages, and open shafts are completely excluded as they do not get underfloor heating.",
  "calculatedSummaryKu": "An explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in Kurdish. Mention explicitly that bathrooms, toilets, auxiliary kitchens, garages, and open shafts are completely excluded as they do not get underfloor heating."
}

Respond only with the valid raw JSON matching this structure.`
            }
          ]
        }],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const contentText = response.choices?.[0]?.message?.content || "";
      let cleanJsonString = contentText.trim();
      if (cleanJsonString.startsWith("```")) {
        const match = cleanJsonString.match(/^(?:```(?:json)?\s*)([\s\S]*?)(?:\s*```)$/);
        if (match) {
          cleanJsonString = match[1].trim();
        }
      }

      const parsedData = JSON.parse(cleanJsonString);
      res.json(parsedData);
    } catch (err: any) {
      console.error("AI Blueprint Analysis failed:", err);
      let errorMsg = err.message || "Blueprint AI visual scanner failed.";
      let isPermissionDenied = false;
      const errorStr = String(err).toLowerCase() + " " + String(err.message || "").toLowerCase();
      
      if (
        errorStr.includes("invalid_api_key") ||
        errorStr.includes("invalid api key") ||
        errorStr.includes("401") ||
        errorStr.includes("authentication") ||
        errorStr.includes("unauthorized")
      ) {
        isPermissionDenied = true;
        errorMsg = "Your Groq API key is invalid or missing (401 Unauthorized). Please select 'Settings' > 'Secrets' and configure a valid GROQ_API_KEY or GEMINI_API_KEY. Alternatively, click the 'Load Fallback Calculations' button below to load the pre-scanned engineering plan immediately.";
      } else if (
        errorStr.includes("access") || 
        errorStr.includes("denied") || 
        errorStr.includes("403") || 
        errorStr.includes("permission_denied")
      ) {
        isPermissionDenied = true;
        errorMsg = "Your project is currently denied access to the Groq/Gemini API (403 Forbidden). Please ensure your key is correct, active, and has suitable permissions under Settings > Secrets, or click 'Load Fallback Calculations' to render pre-scanned plans.";
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

  // Vite development middleware vs Static Production build serving
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