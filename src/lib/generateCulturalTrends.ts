
import { v4 as uuidv4 } from "uuid";
import { Headline } from "./fetchNewsTrends";
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

/**
 * Generate cultural trends using OpenAI based on news headlines
 */
export async function generateCulturalTrends(headlines: Headline[]): Promise<CulturalTrend[]> {
  try {
    // Format headlines for the prompt
    const formattedHeadlines = headlines
      .map(h => `- "${h.title}" (${h.source})`)
      .join("\n");
    
    // Create the prompt for OpenAI
    const prompt = `
Based on the headlines below, summarize 3 emerging cultural trends.
For each trend, give:
- Title: A catchy, concise name for the trend
- Cultural or behavioral insight: What this reveals about society or behavior
- Why this matters for brands or Gen Z: Strategic implications
- Category: A broad category (e.g., "Tech & Identity", "Sustainability", "Mental Health")
- PlatformTags: 2-3 relevant platforms or topics as tags (e.g., "TikTok", "AI", "Sustainability")

Headlines:
${formattedHeadlines}

Respond ONLY with a valid JSON array (no intro, explanation, markdown, or text outside the array). Format exactly like this:
[
  {
    "title": "Trend title",
    "description": "Detailed description including the cultural insight and why it matters",
    "category": "Category",
    "platformTags": ["Tag1", "Tag2", "Tag3"]
  },
  ...
]
`;

console.log("GPT Response:", response);
    
    // Send to OpenAI
    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);
    
    // Parse the response
    try {
      let jsonResponse;
try {
  jsonResponse = JSON.parse(response);
  if (!Array.isArray(jsonResponse)) throw new Error();
} catch (err) {
  console.error("GPT response parsing failed:", response);
  return []; // Or return a default list of trends
}

      
      // Transform to our format with IDs and dates
      return jsonResponse.map(trend => ({
        id: uuidv4(),
        title: trend.title,
        description: trend.description,
        source: "NewsAPI",
        platformTags: trend.platformTags || [],
        category: trend.category || "Uncategorized",
        addedOn: new Date()
      }));
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", response);
      toast.error("Failed to parse trends from AI response");
      throw new Error("Failed to parse cultural trends");
    }
  } catch (error) {
    console.error("Error generating cultural trends:", error);
    throw error;
  }
}

/**
 * Save cultural trends to file (mock implementation)
 * In a real app, this would require a backend service
 */
export function saveCulturalTrends(trends: CulturalTrend[]): void {
  // In a real app, this would call a backend API
  // For now, we'll simulate success
  console.log("Cultural trends that would be saved:", trends);
  localStorage.setItem("cultural_trends_cache", JSON.stringify(trends));
  toast.success("Cultural trends updated successfully");
}
