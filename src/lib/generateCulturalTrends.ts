import { v4 as uuidv4 } from "uuid";
import { Headline } from "./fetchNewsTrends.client.ts";
import { generateWithOpenAI, defaultOpenAIConfig } from "./openai";
import { toast } from "sonner";

export interface CulturalTrend {
  id: string;
  title: string;
  description: string;
  source: string;
  platformTags: string[];
  category: string;
  addedOn: Date;
}

// 🧠 Generate cultural trends using OpenAI based on news or Reddit headlines
export async function generateCulturalTrends(headlines: Headline[]): Promise<CulturalTrend[]> {
  try {
    // 🧾 Format headlines for the GPT prompt
    const formattedHeadlines = headlines
      .map(h => `- "${h.title}" (${h.source})`)
      .join("\n");

    // ✍️ Craft the GPT prompt
    const prompt = `
Based on the lines below, summarize 3 emerging cultural trends.

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

    console.log("Sending Reddit trends prompt to OpenAI:", prompt.substring(0, 200) + "...");

    // 🚀 Send to OpenAI
    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);

    // 🧪 Try parsing GPT output
    console.log("🧠 GPT Raw Reddit Trend Response:", response);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(response);
      if (!Array.isArray(jsonResponse)) {
        throw new Error("Response is not an array");
      }
    } catch (err) {
      console.error("❌ Failed to parse Reddit trend response:", response);
      toast.error("Failed to parse Reddit trends from AI");
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
      source: "Reddit",
      addedOn: new Date(),
    }));

    return culturalTrends;
  } catch (err) {
    console.error("🔥 Failed to generate Reddit trends:", err);
    toast.error("Failed to update Reddit trends");
    return [];
  }
}
// Simple in-memory storage of trends (used by InsightsDashboard)
let allCulturalTrends: CulturalTrend[] = [];

export function saveCulturalTrends(trends: CulturalTrend[]) {
  allCulturalTrends = trends;
}

export function getCulturalTrends(): CulturalTrend[] {
  return allCulturalTrends;
}
