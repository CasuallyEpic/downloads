import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

// Cache for dynamically loaded modules
const moduleCache: { [key: string]: any } = {};

/**
 * Main router that handles all API requests
 * Automatically routes to individual API files
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const url = req.url || "/api";
    
    // Extract the API path (e.g., /api/spotify -> spotify)
    const pathMatch = url.match(/\/api\/([^/?]+)/);
    const apiName = pathMatch ? pathMatch[1] : null;

    if (!apiName) {
      return res.status(404).json({
        error: "Not Found",
        message: "No API specified",
        availableAPIs: getAvailableAPIs(),
        debug: {
          __dirname,
          files: listFiles(),
        }
      });
    }

    // Try to load and execute the API
    const apiModule = await loadAPIModule(apiName);

    if (!apiModule || !apiModule.default) {
      return res.status(404).json({
        error: "Not Found",
        message: `API '${apiName}' not found`,
        availableAPIs: getAvailableAPIs(),
      });
    }

    // Execute the API handler
    return await apiModule.default(req, res);
  } catch (error: any) {
    console.error("API Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message || "An unexpected error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
}

/**
 * Dynamically load an API module
 */
async function loadAPIModule(apiName: string): Promise<any> {
  const cacheKey = apiName;

  // Return cached module if available
  if (moduleCache[cacheKey]) {
    return moduleCache[cacheKey];
  }

  try {
    // Try multiple paths
    const possiblePaths = [
      path.join(__dirname, `${apiName}.js`),
      path.join(__dirname, apiName, "index.js"),
      path.join(process.cwd(), "api", `${apiName}.js`),
      path.join(process.cwd(), "api", apiName, "index.js"),
    ];

    let filePath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      console.warn(`API file not found for '${apiName}' in any of these paths:`, possiblePaths);
      return null;
    }

    // Dynamically import the module
    // Use require() for better compatibility
    const module = require(filePath);

    // Cache the module
    moduleCache[cacheKey] = module;

    return module;
  } catch (error) {
    console.error(`Failed to load API module for '${apiName}':`, error);
    return null;
  }
}

/**
 * Get list of available APIs
 */
function getAvailableAPIs(): string[] {
  try {
    const possibleDirs = [
      __dirname,
      path.join(process.cwd(), "api"),
    ];

    for (const apiDir of possibleDirs) {
      if (fs.existsSync(apiDir)) {
        const files = fs.readdirSync(apiDir);
        return files
          .filter(
            (file) =>
              file.endsWith(".js") &&
              file !== "index.js" &&
              !file.startsWith("_")
          )
          .map((file) => file.replace(".js", ""))
          .sort();
      }
    }

    return [];
  } catch (error) {
    console.error("Error listing available APIs:", error);
    return [];
  }
}

/**
 * Debug helper to list files in the directory
 */
function listFiles(): string[] {
  try {
    const possibleDirs = [
      __dirname,
      path.join(process.cwd(), "api"),
    ];

    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        return fs.readdirSync(dir);
      }
    }

    return [];
  } catch {
    return [];
  }
}
