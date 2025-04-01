import { v4 as uuidv4 } from "uuid";
import { Headline } from "./fetchNewsTrends.client";
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

let allCulturalTrends: CulturalTrend[] = [];

export async function generateCulturalTrends(headlines: Headline[]): Promise<CulturalTrend[]> {
  try {
    const sourceType = headlines[0]?.source?.includes("r/") ? "Reddit" : "NewsAPI";
    console.log(`Generating trends for source type: ${sourceType}`);

    const formattedHeadlines = headlines.map(h => `- "${h.title}" (${h.source})`).join("\n");
    const numTrends = Math.min(10, Math.max(3, Math.floor(headlines.length / 2)));

    const prompt = `
    You're a sharp cultural strategist decoding emerging shifts in Gen Z behavior.
    
    Based on the following headlines, identify ${numTrends} cultural or behavioral trends that matter to youth audiences. Focus on shifts in thinking, behavior, and identity. 
    
    Each trend must include:
    - title: short, specific, and original — DO NOT start with “Inside” or use generic formats like “The Rise of”, “Trend”, “Phenomenon”, or “Revolution”
    - description: 1–2 sentence cultural insight based on observed behavior
    - category: one of ["Belonging & Identity", "Digital Life", "Sustainability", "Mental Health", "Social Fads", "Finance", "Innovation"]
    - platformTags: 2–3 platforms where this trend would surface (e.g., TikTok, Twitter, Reddit, Discord)
    
    Headlines:
    ${formattedHeadlines}
    
    Return only a valid JSON array:
    [
      {
        "title": "Sample Trend",
        "description": "Cultural/behavioral shift explained.",
        "category": "Digital Life",
        "platformTags": ["TikTok", "Twitter"]
      }
    ]
    `;

    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);
    console.log(`🧠 GPT Raw ${sourceType} Trend Response:`, response);

    const cleanedJson = extractJsonFromResponse(response);
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedJson);
      if (!Array.isArray(jsonResponse)) throw new Error("Response is not an array");
    } catch (err) {
      console.error(`❌ Failed to parse ${sourceType} trend response:`, cleanedJson);
      return createFallbackTrendsFromHeadlines(headlines, sourceType);
    }

    const categoryRemap: { [key: string]: string } = {
      "Identity": "Belonging & Identity",
      "Belonging": "Belonging & Identity",
      "Youth Culture": "Belonging & Identity",
      "Online Behavior": "Digital Life",
      "Technology": "Innovation",
      "AI": "Innovation",
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

    const culturalTrends: CulturalTrend[] = jsonResponse.map((trend: any) => ({
      id: uuidv4(),
      title: trend.title,
      description: trend.description,
      category: trend.category || "Uncategorized",
      platformTags: trend.platformTags || [],
      source: sourceType,
      addedOn: new Date(),
    }));

    saveCulturalTrends(culturalTrends);
    return culturalTrends;
  } catch (err) {
    console.error(`🔥 Failed to generate cultural trends:`, err);
    toast.error(`Failed to generate cultural trends`);
    return createFallbackTrendsFromHeadlines(headlines, headlines[0]?.source?.includes("r/") ? "Reddit" : "NewsAPI");
  }
}

export function getCulturalTrends(): CulturalTrend[] {
  return allCulturalTrends;
}

export function saveCulturalTrends(trends: CulturalTrend[]): void {
  allCulturalTrends = [...allCulturalTrends, ...trends];
  try {
    localStorage.setItem("culturalTrends", JSON.stringify(allCulturalTrends));
  } catch (err) {
    console.warn("Could not save trends to localStorage", err);
  }
}

export function createFallbackTrendsFromHeadlines(headlines: Headline[], sourceType: string): CulturalTrend[] {
  const fallbackTrends: CulturalTrend[] = headlines.map((headline) => ({
    id: uuidv4(),
    title: headline.title,
    description: `This trend is based on the headline "${headline.title}" from ${sourceType}.`,
    category: "Uncategorized",
    platformTags: [sourceType],
    source: sourceType,
    addedOn: new Date(),
  }));

  saveCulturalTrends(fallbackTrends);
  return fallbackTrends;
}

export function clearCulturalTrends(): void {
  allCulturalTrends = [];
  localStorage.removeItem("culturalTrends");
  toast.success("Cultural trends cleared!");
}

export function getCachedCulturalTrends(): CulturalTrend[] {
  try {
    const raw = localStorage.getItem("culturalTrends");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((t: any) => ({
        ...t,
        addedOn: new Date(t.addedOn),
      }));
    }
  } catch (err) {
    console.warn("Could not load cached trends", err);
  }
  return [];
}
