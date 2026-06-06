import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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
