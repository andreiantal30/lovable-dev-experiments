
import { v4 as uuidv4 } from "uuid";
import { Headline } from "./fetchNewsTrends.client.ts";
import { generateWithOpenAI, defaultOpenAIConfig } from "./openai";
import { toast } from "sonner";
import { extractJsonFromResponse } from "./campaign/utils";

export interface CulturalTrend {
  id: string;
  title: string;
  description: string;
  source: string;
  platformTags: string[];
  category: string;
  addedOn: Date;
}

// Simple in-memory storage of trends
let allCulturalTrends: CulturalTrend[] = [];

// 🧠 Generate cultural trends using OpenAI based on news or Reddit headlines
export async function generateCulturalTrends(headlines: Headline[]): Promise<CulturalTrend[]> {
  try {
    // Determine source from the headlines (default to "Unknown" if not found)
    const sourceType = headlines[0]?.source?.includes("r/") ? "Reddit" : "NewsAPI";
    console.log(`Generating trends for source type: ${sourceType}`);

    // 🧾 Format headlines for the GPT prompt
    const formattedHeadlines = headlines
      .map(h => `- "${h.title}" (${h.source})`)
      .join("\n");

    // Determine number of trends to generate based on available headlines
    const numTrends = Math.min(10, Math.max(3, Math.floor(headlines.length / 2)));
    
    // ✍️ Craft the GPT prompt
    const prompt = `
Based on the lines below, summarize ${numTrends} emerging cultural trends.

For each trend, give:
- Title: A catchy, concise name
- Cultural or behavioral insight: What this reveals about society or behavior
- Why this matters for brands or Gen Z: Strategic implications
- PlatformTags: 2-3 relevant platforms or topics as tags (e.g., "TikTok", "AI", "Sustainability")

Headlines:
${formattedHeadlines}

Please return ONLY a valid JSON array. No explanation, no markdown, no extra text.

Format strictly like this:
[
  {
    "title": "Trend title",
    "description": "Detailed cultural explanation",
    "category": "Belonging & Identity",
    "platformTags": ["TikTok", "Instagram"]
  },
  ...
]
`;

    console.log(`Sending ${sourceType} trends prompt to OpenAI: ${prompt.substring(0, 200)}...`);

    // 🚀 Send to OpenAI
    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);

    // 🧪 Clean and parse GPT output
    console.log(`🧠 GPT Raw ${sourceType} Trend Response:`, response);
    
    // Extract JSON from response even if wrapped in markdown code blocks
    const cleanedJson = extractJsonFromResponse(response);
    console.log(`Cleaned JSON for parsing:`, cleanedJson);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedJson);
      if (!Array.isArray(jsonResponse)) {
        throw new Error("Response is not an array");
      }
    } catch (err) {
      console.error(`❌ Failed to parse ${sourceType} trend response:`, cleanedJson);
      toast.error(`Failed to parse ${sourceType} trends from AI`);
      return [];
    }

    // 🔁 Optional: Map vague or duplicate categories to cleaner tags
    const categoryRemap: { [key: string]: string } = {
      "Identity": "Belonging & Identity",
      "Belonging": "Belonging & Identity",
      "Youth Culture": "Gen Z & Youth",
      "Online Behavior": "Digital Life",
      "Technology": "Innovation & Tech",
      "AI": "Innovation & Tech",
      "Uncategorized": "Other",
    };

    jsonResponse = jsonResponse.map((trend: any) => {
      const rawCat = trend.category || "Uncategorized";
      const mappedCat = categoryRemap[rawCat] || rawCat;
      return {
        ...trend,
        category: mappedCat,
      };
    });

    // ✅ Format for display
    const culturalTrends: CulturalTrend[] = jsonResponse.map((trend: any) => ({
      id: uuidv4(),
      title: trend.title,
      description: trend.description,
      category: trend.category || "Uncategorized",
      platformTags: trend.platformTags || [],
      // Use the determined source type
      source: sourceType,
      addedOn: new Date(),
    }));

    return culturalTrends;
  } catch (err) {
    console.error(`🔥 Failed to generate cultural trends:`, err);
    toast.error(`Failed to generate cultural trends`);
    return [];
  }
}

// Retrieve all trends from in-memory storage
export function getCulturalTrends(): CulturalTrend[] {
  return allCulturalTrends;
}

// Save trends to in-memory storage
export function saveCulturalTrends(trends: CulturalTrend[]) {
  console.log(`Saving ${trends.length} cultural trends to memory:`, trends);
  allCulturalTrends = trends;
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem("cultural_trends_cache", JSON.stringify(trends));
    console.log("Saved trends to localStorage");
  } catch (error) {
    console.error("Failed to save trends to localStorage:", error);
  }
}

// Get cached trends from localStorage
export function getCachedCulturalTrends(): CulturalTrend[] {
  try {
    const cached = localStorage.getItem("cultural_trends_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Convert string dates back to Date objects
      const trends = parsed.map((trend: any) => ({
        ...trend,
        addedOn: new Date(trend.addedOn)
      }));
      console.log(`Loaded ${trends.length} trends from localStorage`);
      return trends;
    }
  } catch (error) {
    console.error("Error loading cached trends:", error);
  }
  
  // Return empty array if nothing found
  return [];
}
