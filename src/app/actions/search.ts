'use server';

import { resolveApiRoute } from '@/lib/api-router';
// Using generic fetch for Google Gemini API as @google/genai might not fully support our custom models or exact endpoints yet
// Alternatively we could use the @google/genai SDK. Since we want to use specific model strings we can just use the fetch API or SDK depending on requirements.
// For now, these actions only do external API calls and use AI for parsing.
import { GoogleGenAI } from '@google/genai';
import { youtubeApiKey, tavilyApiKey } from '@/lib/env';

// Initialize SDK with a generic approach, but we will instantiate per-request to allow BYOK
function getGenAIClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail: string;
  platform: 'youtube' | 'web';
}

export interface SearchParams {
  query: string;
  userApiKey?: string | null;
}

/**
 * Searches YouTube using the YouTube Data API.
 */
export async function searchYouTube(params: SearchParams): Promise<SearchResultItem[]> {
  try {
    const YOUTUBE_API_KEY = youtubeApiKey;
    if (!YOUTUBE_API_KEY) {
      console.warn('YOUTUBE_API_KEY is not configured.');
      return []; // Return empty if not configured
    }

    const { query } = params;

    // First, let's optionally use DEFAULT_OPS to refine the query if needed,
    // but for now we just use the raw query to external API to save latency.

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`);

    if (!res.ok) {
      if (res.status === 429) {
         throw new Error('YouTube API rate limit exceeded. Please try again later.');
      }
      throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Format the response
        return data.items.map((item: { id: { videoId: string }, snippet: { title: string, description: string, thumbnails?: { high?: { url: string }, default?: { url: string } } } }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
      platform: 'youtube'
    }));

  } catch (error) {
    console.error('Error in searchYouTube:', error);
    throw error;
  }
}

/**
 * Searches the web using Tavily API.
 */
export async function searchWeb(params: SearchParams): Promise<SearchResultItem[]> {
  try {
    const TAVILY_API_KEY = tavilyApiKey;
    if (!TAVILY_API_KEY) {
       console.warn('TAVILY_API_KEY is not configured.');
       return [];
    }

    const { query } = params;

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        include_images: true,
        max_results: 5,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
         throw new Error('Tavily API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Tavily API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

        return data.results.map((item: { title: string, url: string, content: string }) => ({
      id: crypto.randomUUID(),
      title: item.title,
      url: item.url,
      description: item.content,
      thumbnail: '', // Tavily images are in a separate array, could map if needed
      platform: 'web'
    }));

  } catch (error) {
    console.error('Error in searchWeb:', error);
    throw error;
  }
}

/**
 * Parses a natural language query into structured sub-queries using Gemini 3.1 Flash Lite.
 */
export async function parseSearchIntent(params: SearchParams): Promise<{ youtubeQuery: string; webQuery: string }> {
  try {
    const { model, apiKey } = resolveApiRoute({
      operationType: 'DEFAULT_OPS',
      userApiKey: params.userApiKey
    });

    const ai = getGenAIClient(apiKey);

    const prompt = `
      Analyze the following user query and generate two optimized search queries.
      One for YouTube (focusing on video tutorials, lectures) and one for Web Search (focusing on articles, documentation, pdfs).
      Return ONLY a valid JSON object with keys "youtubeQuery" and "webQuery".

      User Query: "${params.query}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
         responseMimeType: 'application/json'
      }
    });

    if (!response.text) {
      throw new Error('No response from AI model');
    }

    const parsed = JSON.parse(response.text);
    return {
      youtubeQuery: parsed.youtubeQuery || params.query,
      webQuery: parsed.webQuery || params.query
    };

  } catch (error: unknown) {
    console.error('Error in parseSearchIntent:', error);
    // Fallback to raw query if AI fails
    return {
      youtubeQuery: params.query,
      webQuery: params.query
    };
  }
}

/**
 * Unified search function that coordinates intent parsing and parallel fetching.
 */
export async function performUnifiedSearch(params: SearchParams): Promise<SearchResultItem[]> {
  try {
    // 1. Parse intent using DEFAULT_OPS model
    const queries = await parseSearchIntent(params);

    // 2. Fetch from APIs in parallel
    const [youtubeResults, webResults] = await Promise.all([
      searchYouTube({ ...params, query: queries.youtubeQuery }),
      searchWeb({ ...params, query: queries.webQuery })
    ]);

    // 3. Optional: Route raw results back through DEFAULT_OPS for final formatting/filtering
    // (Skipping for now to save latency, but the rule says "route it back through this model to parse and format it")

    // Let's implement the post-processing as requested by the prompt rules:
    // "Once external APIs return raw data, route it back through this model to parse and format it for the frontend."

    const { model, apiKey } = resolveApiRoute({
      operationType: 'DEFAULT_OPS',
      userApiKey: params.userApiKey
    });

    const ai = getGenAIClient(apiKey);

    const formattingPrompt = `
      You are an AI assistant. Format and refine the following raw search results into a clean, concise, and structured format.
      Keep the JSON array structure. Fix any typos in titles and summarize descriptions if they are too long.
      Return ONLY a valid JSON array of objects.

      Raw Results:
      ${JSON.stringify([...youtubeResults, ...webResults])}
    `;

    try {
        const formatResponse = await ai.models.generateContent({
            model: model,
            contents: formattingPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        if (formatResponse.text) {
             const finalResults: SearchResultItem[] = JSON.parse(formatResponse.text);
             return finalResults;
        }
    } catch (formattingError) {
        console.error('Error during AI formatting, returning raw results', formattingError);
        // Fallback to raw results
        return [...youtubeResults, ...webResults];
    }

    return [...youtubeResults, ...webResults];

  } catch (error: unknown) {
    console.error('Error in performUnifiedSearch:', error);
    if (error instanceof Error) {
        throw new Error(`Search failed: ${error.message}`);
    }
    throw new Error('Search failed due to an unknown error.');
  }
}
