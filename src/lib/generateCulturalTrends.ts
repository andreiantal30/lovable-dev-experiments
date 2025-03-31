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

      // Fallback: Try to create simple trends from headlines directly
      console.log("⚠️ Attempting fallback trend generation from headlines directly");
      return createFallbackTrendsFromHeadlines(headlines, sourceType);
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

    // ✅ Store in memory + localStorage
    saveCulturalTrends(culturalTrends);

    return culturalTrends;
  } catch (err) {
    console.error(`🔥 Failed to generate cultural trends:`, err);
    toast.error(`Failed to generate cultural trends`);

    // Last resort fallback
    return createFallbackTrendsFromHeadlines(headlines, headlines[0]?.source?.includes("r/") ? "Reddit" : "NewsAPI");
  }
}

// Create fallback trends directly from headlines when AI generation fails
function createFallbackTrendsFromHeadlines(headlines: Headline[], sourceType: string): CulturalTrend[] {
  console.log(`Creating ${Math.min(10, headlines.length)} fallback trends from headlines`);

  // Group headlines by common themes or keywords
  const topicGroups = groupHeadlinesByTopics(headlines);

  // Convert the top groups to trends
  return topicGroups.slice(0, 10).map((group) => {
    const mainHeadline = group.headlines[0];
    const topic = group.topic;

    // Determine category based on keywords
    let category = "News & Current Events";
    if (topic.match(/tech|ai|digital|computer|robot|internet/i)) category = "Innovation & Tech";
    else if (topic.match(/climate|environment|green|sustain|planet|earth/i)) category = "Sustainability & Environment";
    else if (topic.match(/mental|health|well|therapy|anxiety|stress/i)) category = "Mental Health & Wellbeing";
    else if (topic.match(/social|community|culture|identity|belong/i)) category = "Belonging & Identity";
    else if (topic.match(/finance|money|economy|market|invest|crypto/i)) category = "Finance & Economics";

    // Generate relevant platform tags
    const platformTags = generateRelevantPlatformTags(topic, category);

    return {
      id: uuidv4(),
      title: createTrendTitle(topic, group.headlines),
      description: `Trend based on news about ${topic}, including "${mainHeadline.title}"`,
      source: sourceType,
      platformTags,
      category,
      addedOn: new Date()
    };
  });
}

// Group headlines by common topics
function groupHeadlinesByTopics(headlines: Headline[]): { topic: string, headlines: Headline[] }[] {
  const groups: { [key: string]: Headline[] } = {};

  // Extract keywords from headlines
  headlines.forEach(headline => {
    // Get important keywords from the title
    const words = headline.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'what'].includes(word));

    // Find the most relevant keyword
    const mainKeyword = words[0] || 'news';

    if (!groups[mainKeyword]) {
      groups[mainKeyword] = [];
    }

    groups[mainKeyword].push(headline);
  });

  // Convert to array and sort by group size
  return Object.entries(groups)
    .map(([topic, headlines]) => ({ topic, headlines }))
    .sort((a, b) => b.headlines.length - a.headlines.length);
}

// Create a catchy title from keywords
function createTrendTitle(topic: string, headlines: Headline[]): string {
  // Capitalize the topic
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  // Generate different title patterns
  const titlePatterns = [
    `The ${capitalizedTopic} Wave`,
    `${capitalizedTopic} Revolution`,
    `Rise of ${capitalizedTopic}`,
    `${capitalizedTopic} Movement`,
    `${capitalizedTopic} Renaissance`,
    `${capitalizedTopic} Phenomenon`
  ];

  // Use a different pattern based on the length of the headlines array
  const patternIndex = headlines.length % titlePatterns.length;
  return titlePatterns[patternIndex];
}

// Generate relevant platform tags based on topic and category
function generateRelevantPlatformTags(topic: string, category: string): string[] {
  const tags: string[] = [];

  // Add topic-specific platform
  if (topic.match(/video|watch|stream/i)) tags.push('YouTube', 'TikTok');
  else if (topic.match(/photo|image|picture/i)) tags.push('Instagram', 'Pinterest');
  else if (topic.match(/news|politics|world/i)) tags.push('Twitter', 'News Apps');
  else if (topic.match(/business|work|career/i)) tags.push('LinkedIn', 'Twitter');
  else tags.push('Social Media');

  // Add category-specific platform
  switch (category) {
    case "Innovation & Tech": 
      tags.push('Reddit', 'Product Hunt');
      break;
    case "Sustainability & Environment":
      tags.push('Instagram', 'Change.org');
      break;
    case "Mental Health & Wellbeing":
      tags.push('TikTok', 'Reddit');
      break;
    case "Belonging & Identity":
      tags.push('Twitter', 'TikTok');
      break;
    case "Finance & Economics":
      tags.push('Twitter', 'Reddit');
      break;
    default:
      tags.push('Twitter');
  }

  // Deduplicate and return top 3
  return [...new Set(tags)].slice(0, 3);
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