import "server-only";
import { randomInt } from "node:crypto";
import { cookies } from "next/headers";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY is missing. Search features will be disabled.");
}
export const tavilyApiKey = TAVILY_API_KEY || "";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.warn("Warning: YOUTUBE_API_KEY is missing. Video resources will be disabled.");
}
export const youtubeApiKey = YOUTUBE_API_KEY || "";

export async function getAvailableGeminiKey(): Promise<string> {
  // Priority 1: User-provided key via HttpOnly cookie (Secure)
  const cookieStore = await cookies();
  const cookieKey = cookieStore.get("bou_user_api_key")?.value;
  if (cookieKey && cookieKey.trim().length > 0) {
    return cookieKey.trim();
  }

  // Priority 2: Load-balanced environment keys
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    // Add legacy support for previously used keys if any of the above are missing
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ].filter((key) => key !== undefined && key !== null && key.trim().length > 0) as string[];

  if (keys.length === 0) {
    throw new Error("No Gemini API keys found in environment variables");
  }

  const randomIndex = randomInt(0, keys.length);
  return keys[randomIndex];
}
