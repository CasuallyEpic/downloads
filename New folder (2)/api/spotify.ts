import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { VercelRequest, VercelResponse } from "@vercel/node";

function validateUrlParam(req: VercelRequest): string | null {
  const url = req.url || "";
  const urlParams = new URLSearchParams(url.split("?")[1] || "");
  return urlParams.get("url");
}

function createErrorResponse(res: VercelResponse, message: string, status: number = 500) {
  res.status(status).json({ error: message });
}

function createSuccessResponse(res: VercelResponse, data: any) {
  res.status(200).json({ success: true, ...data });
}

// Encode filename for UTF-8 header support
function encodeRFC5987ValueChars(str: string) {
  return encodeURIComponent(str)
    .replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16))
    .replace(/%(7C|60|5E)/g, (match) => match.toLowerCase());
}

// Scrape API key from Spotdown
export async function getSpotifyApiKey(): Promise<string | null> {
  try {
    const response = await fetch("https://spotdown.org/playlist");
    const html = await response.text();
    const $ = cheerio.load(html);

    const chunkScripts = $('script[src*="/_next/static/chunks/"]');
    const chunkUrls: string[] = [];

    chunkScripts.each((_, element) => {
      const src = $(element).attr("src");
      if (src) {
        const absoluteUrl = src.startsWith("http")
          ? src
          : `https://spotdown.org${src}`;
        chunkUrls.push(absoluteUrl);
      }
    });

    for (const chunkUrl of chunkUrls) {
      try {
        const chunkResponse = await fetch(chunkUrl);
        const chunkContent = await chunkResponse.text();

        const apiKeyPattern = /let\s+o\s*=\s*["']([a-f0-9]{64})["']/;
        const match = chunkContent.match(apiKeyPattern);

        if (match && match[1]) {
          return match[1];
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function downloadSong(spotifyUrl: string): Promise<any> {
  try {
    const apiKey = await getSpotifyApiKey();

    if (!apiKey) {
      throw new Error("Failed to retrieve Spotify API key");
    }

    const response = await fetch("https://spotdown.org/api/download", {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        origin: "https://spotdown.org",
        referer: "https://spotdown.org/playlist",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ url: spotifyUrl }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response;
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export async function getSongDetails(searchQuery: string): Promise<any> {
  try {
    const apiKey = await getSpotifyApiKey();

    if (!apiKey) {
      throw new Error("Failed to retrieve Spotify API key");
    }

    const encodedQuery = encodeURIComponent(searchQuery);

    const response = await fetch(
      `https://spotdown.org/api/song-details?url=${encodedQuery}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          referer: "https://spotdown.org/playlist",
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36",
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || "";

  if (url.includes("/get-details")) {
    const searchQuery = validateUrlParam(req);
    if (!searchQuery) {
      return createErrorResponse(res, "URL parameter is required", 400);
    }

    try {
      const data = await getSongDetails(searchQuery);
      if (data.error) {
        return createErrorResponse(res, data.message);
      }
      return createSuccessResponse(res, data);
    } catch (error: any) {
      return createErrorResponse(res, `Failed to fetch song details: ${error.message}`);
    }
  }

  if (url.includes("/download")) {
    const spotifyUrl = validateUrlParam(req);
    if (!spotifyUrl) {
      return createErrorResponse(res, "URL parameter is required", 400);
    }

    try {
      const songDetails = await getSongDetails(spotifyUrl);
      if (songDetails.error) {
        return createErrorResponse(res, songDetails.message);
      }

      const song = songDetails.songs?.[0];
      let filename = "song.mp3";

      if (song?.title) {
        const sanitizedTitle = song.title
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
          .trim();
        filename = `${sanitizedTitle}.mp3`;
      }

      const response = await downloadSong(spotifyUrl);
      if (response.error) {
        return createErrorResponse(res, response.message);
      }

      const encodedFilename = encodeRFC5987ValueChars(filename);
      const asciiFilename = filename.replace(/[^\x20-\x7E]/g, "") || "song.mp3";

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      res.setHeader("Content-Type", "audio/mpeg");

      // Send file buffer
      const buffer = await response.buffer();
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error: any) {
      return createErrorResponse(res, `Failed to download song: ${error.message}`);
    }
  }

  res.status(200).json({
    message: "Spotify Downloader API",
    endpoints: [
      "GET /api/spotify/get-details?url=<spotify_url>",
      "GET /api/spotify/download?url=<spotify_url>"
    ]
  });
}