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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required in secrets");
      }
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 data found" });
      }

      // Remove prefix if exists
   const groq = new Groq({ apiKey });

const response = await groq.chat.completions.create({
  model: "llama-3.2-90b-vision-preview",
  messages: [{
    role: "user",
    content: [
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${cleanBase64}` }
      },
      {
        type: "text",
        text: `Analyze this architectural floor plan or house blueprint image with extreme precision. 
This image represents a real residential or commercial blueprint layout. Please examine it carefully, identifying all written text, markers, dimensions, stamps, and room boundaries.

Particularly identify and parse:
1. Kurdish and Arabic room labels written directly in the rooms, such as:
   - "نوستن" / "ژووری نووستن" (Bedrooms / Sleeping Rooms)
   - "مەتبەخ" / "مه تبه خ" (Kitchen)
   - "مساعد مەتبەخ" / "چێشتخانەی یاریدەدەر" (Auxiliary / Wet Kitchen)
   - "هۆڵ" / "هۆڵی دانیشتن" (Living Hall / Salon)
   - "کراوە" (Open Shaft / Lightwell / Balcony / Courtyard)
   - "توالیت" (Toilet)
   - "حەمام" / "حەمام و توالیت" (Bathroom / Shower room)
   - "گراج" / "گەراج" (Garage)
   - "کۆگا" (Storage)
   - "مەمەڕ" / "ڕێڕەو" (Corridor / Hallway)

2. Read the written metrics, dimension strings and measurements shown with arrows or boundaries for each room (e.g. "3.2m", "4.2m", "3m", "2.95m", "1.7m", "1.3m", "4.6m", "10.2").
3. Use those measurements to calculate the exact or highly accurate area in square meters (sqm) for each space (Area = width * length). For example:
   - "نوستن" with dimensions "3.2m" by "4.2m" is exactly 13.44 sqm.
   - "نوستن" with dimensions "4.2m" by "3.0m" is exactly 12.60 sqm.
   - "مساعد مەتبەخ" with "2.95m" by "2.0m" is exactly 5.90 sqm.
   - "حەمام" with "1.6m" by "1.7m" is exactly 2.72 sqm.
   - "توالیت" with "1.3m" by "1.7m" is exactly 2.21 sqm.
   - "کراوە" with "3.55m" by "1.2m" is exactly 4.26 sqm.
   - "هۆڵ" has width "4.6m" and length approximately "4.8m" to "6m" (approx. 22-28 sqm).
   - "مەتبەخ" has width "4.6m" and length "4.6m" (approx. 21 sqm).

4. Carefully calculate underfloor heating metrics for each room zone:
   - loopCount: A standard hydronic underfloor heating circuit loop covers approximately 15 to 20 sqm of flooring. For small rooms < 15 sqm (like bedroom 12.6 sqm), configure 1 loop. For spaces 15 - 30 sqm (like living hall), configure 2 loops. For bathroom/toilets, configure 1 small dedicated loop or combine with nearby hallway loop (if very small, specify 1 loop).
   - heatingOutputRequiredKw: Approximate required thermal capacity for the room in kW (approx. areaSqm * 0.1 kW or more for cold days).

Then output the calculated blueprint analytics strictly matching the following JSON response schema:
1. "rooms": array of identified rooms with fields: "nameEn", "nameKu", "areaSqm", "heatingOutputRequiredKw", "loopCount"
2. "totalAreaSqm": sum of all room areas (number)
3. "recommendedBoilerKw": calculated total boiler capacity in kW (sum of heating output + 20% safety margin, minimum 12kW)
4. "recommendedManifoldPorts": total number of manifold ports (equal to the sum of all rooms loop counts)
5. "estimatedPipeSpacingCm": typical spacing distance recommended in cm (usually 15cm for living spaces, 10cm for bathrooms to increase comfort).
6. "calculatedSummaryEn": an explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in English based on the exact rooms detected.
7. "calculatedSummaryKu": an explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in Kurdish based on the exact rooms detected.
 Respond only with valid raw JSON.`
      }
    ]
  }],
  response_format: { type: "json_object" },
  max_tokens: 2000
});

            text: `Analyze this architectural floor plan or house blueprint image with extreme precision. 
This image represents a real residential or commercial blueprint layout. Please examine it carefully, identifying all written text, markers, dimensions, stamps, and room boundaries.

Particularly identify and parse:
1. Kurdish and Arabic room labels written directly in the rooms, such as:
   - "نوستن" / "ژووری نووستن" (Bedrooms / Sleeping Rooms)
   - "مەتبەخ" / "مه تبه خ" (Kitchen)
   - "مساعد مەتبەخ" / "چێشتخانەی یاریدەدەر" (Auxiliary / Wet Kitchen)
   - "هۆڵ" / "هۆڵی دانیشتن" (Living Hall / Salon)
   - "کراوە" (Open Shaft / Lightwell / Balcony / Courtyard)
   - "توالیت" (Toilet)
   - "حەمام" / "حەمام و توالیت" (Bathroom / Shower room)
   - "گراج" / "گەراج" (Garage)
   - "کۆگا" (Storage)
   - "مەمەڕ" / "ڕێڕەو" (Corridor / Hallway)

2. Read the written metrics, dimension strings and measurements shown with arrows or boundaries for each room (e.g. "3.2m", "4.2m", "3m", "2.95m", "1.7m", "1.3m", "4.6m", "10.2").
3. Use those measurements to calculate the exact or highly accurate area in square meters (sqm) for each space (Area = width * length). For example:
   - "نوستن" with dimensions "3.2m" by "4.2m" is exactly 13.44 sqm.
   - "نوستن" with dimensions "4.2m" by "3.0m" is exactly 12.60 sqm.
   - "مساعد مەتبەخ" with "2.95m" by "2.0m" is exactly 5.90 sqm.
   - "حەمام" with "1.6m" by "1.7m" is exactly 2.72 sqm.
   - "توالیت" with "1.3m" by "1.7m" is exactly 2.21 sqm.
   - "کراوە" with "3.55m" by "1.2m" is exactly 4.26 sqm.
   - "هۆڵ" has width "4.6m" and length approximately "4.8m" to "6m" (approx. 22-28 sqm).
   - "مەتبەخ" has width "4.6m" and length "4.6m" (approx. 21 sqm).

4. Carefully calculate underfloor heating metrics for each room zone:
   - loopCount: A standard hydronic underfloor heating circuit loop covers approximately 15 to 20 sqm of flooring. For small rooms < 15 sqm (like bedroom 12.6 sqm), configure 1 loop. For spaces 15 - 30 sqm (like living hall), configure 2 loops. For bathroom/toilets, configure 1 small dedicated loop or combine with nearby hallway loop (if very small, specify 1 loop).
   - heatingOutputRequiredKw: Approximate required thermal capacity for the room in kW (approx. areaSqm * 0.1 kW or more for cold days).

Then output the calculated blueprint analytics strictly matching the following JSON response schema:
1. "rooms": array of identified rooms with fields: "nameEn", "nameKu", "areaSqm", "heatingOutputRequiredKw", "loopCount"
2. "totalAreaSqm": sum of all room areas (number)
3. "recommendedBoilerKw": calculated total boiler capacity in kW (sum of heating output + 20% safety margin, minimum 12kW)
4. "recommendedManifoldPorts": total number of manifold ports (equal to the sum of all rooms loop counts)
5. "estimatedPipeSpacingCm": typical spacing distance recommended in cm (usually 15cm for living spaces, 10cm for bathrooms to increase comfort).
6. "calculatedSummaryEn": an explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in English based on the exact rooms detected.
7. "calculatedSummaryKu": an explanatory, highly detailed engineering summary of the design, manifold location recommendations, and layout instructions in Kurdish based on the exact rooms detected.

Respond only with the valid raw JSON matching this structure. Make sure your output is perfectly structured and contains no extra text.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "rooms",
              "totalAreaSqm",
              "recommendedBoilerKw",
              "recommendedManifoldPorts",
              "estimatedPipeSpacingCm",
              "calculatedSummaryEn",
              "calculatedSummaryKu"
            ],
            properties: {
              rooms: {
                type: Type.ARRAY,
                description: "Array of detected rooms from floor plan blueprint",
                items: {
                  type: Type.OBJECT,
                  required: ["nameEn", "nameKu", "areaSqm", "heatingOutputRequiredKw", "loopCount"],
                  properties: {
                    nameEn: { type: Type.STRING },
                    nameKu: { type: Type.STRING },
                    areaSqm: { type: Type.NUMBER },
                    heatingOutputRequiredKw: { type: Type.NUMBER },
                    loopCount: { type: Type.INTEGER }
                  }
                }
              },
              totalAreaSqm: { type: Type.NUMBER },
              recommendedBoilerKw: { type: Type.NUMBER },
              recommendedManifoldPorts: { type: Type.INTEGER },
              estimatedPipeSpacingCm: { type: Type.INTEGER },
              calculatedSummaryEn: { type: Type.STRING },
              calculatedSummaryKu: { type: Type.STRING }
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (err: any) {
      console.error("AI Blueprint Analysis failed:", err);
      let errorMsg = err.message || "Blueprint AI visual scanner failed.";
      let isPermissionDenied = false;
      if (
        errorMsg.toLowerCase().includes("access") || 
        errorMsg.toLowerCase().includes("denied") || 
        errorMsg.toLowerCase().includes("403") || 
        errorMsg.toLowerCase().includes("permission_denied")
      ) {
        isPermissionDenied = true;
        errorMsg = "Your Google AI Studio project is currently denied access to the Gemini API (403 PERMISSION_DENIED). To fix this, please ensure your project has billing enabled or configure a valid GEMINI_API_KEY under Settings > Secrets.";
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
