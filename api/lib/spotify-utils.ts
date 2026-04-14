import fetch from "node-fetch";
import * as cheerio from "cheerio";

export function validateUrlParam(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("url");
  } catch {
    return null;
  }
}

export function encodeRFC5987ValueChars(str: string) {
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