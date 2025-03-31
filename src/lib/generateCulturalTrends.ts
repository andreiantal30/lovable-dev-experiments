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

    const formattedHeadlines = headlines
      .map(h => `- "${h.title}" (${h.source})`)
      .join("\n");

    const numTrends = Math.min(10, Math.max(3, Math.floor(headlines.length / 2)));

    const prompt = `
You are a cultural strategist. Given the following headlines, identify emerging cultural or behavioral trends relevant to Gen Z or youth audiences.

For each trend, return:
- title: short, fresh, original, *non-generic* (avoid words like “Revolution”, “Trend”, “Phenomenon”)
- description: 1-2 sentences with a clear cultural/behavioral insight
- category: choose from Belonging & Identity, Digital Life, Sustainability, Mental Health, Social Fads, Finance, or Innovation
- platformTags: list 2-3 tags like TikTok, Twitter, YouTube, Discord, etc.

Headlines:
${formattedHeadlines}

Respond ONLY with a valid JSON array. Do not include explanations or markdown.

[
  {
    "title": "Sample Trend",
    "description": "Insightful explanation of behavior or cultural signal.",
    "category": "Digital Life",
    "platformTags": ["TikTok", "Reddit"]
  }
]
`;

    console.log(`Sending ${sourceType} trends prompt to OpenAI: ${prompt.substring(0, 200)}...`);
    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);
    console.log(`🧠 GPT Raw ${sourceType} Trend Response:`, response);

    const cleanedJson = extractJsonFromResponse(response);
    console.log(`Cleaned JSON for parsing:`, cleanedJson);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedJson);
      if (!Array.isArray(jsonResponse)) throw new Error("Response is not an array");
    } catch (err) {
      console.error(`❌ Failed to parse ${sourceType} trend response:`, cleanedJson);
      console.log("⚠️ Attempting fallback trend generation from headlines directly");
      return createFallbackTrendsFromHeadlines(headlines, sourceType);
    }

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

function createFallbackTrendsFromHeadlines(headlines: Headline[], sourceType: string): CulturalTrend[] {
  console.log(`Creating ${Math.min(10, headlines.length)} fallback trends from headlines`);
  const topicGroups = groupHeadlinesByTopics(headlines);

  return topicGroups.slice(0, 10).map((group) => {
    const mainHeadline = group.headlines[0];
    const topic = group.topic;

    let category = "News & Current Events";
    if (topic.match(/tech|ai|digital|computer|robot|internet/i)) category = "Innovation & Tech";
    else if (topic.match(/climate|environment|green|sustain|planet|earth/i)) category = "Sustainability & Environment";
    else if (topic.match(/mental|health|well|therapy|anxiety|stress/i)) category = "Mental Health & Wellbeing";
    else if (topic.match(/social|community|culture|identity|belong/i)) category = "Belonging & Identity";
    else if (topic.match(/finance|money|economy|market|invest|crypto/i)) category = "Finance & Economics";

    const platformTags = generateRelevantPlatformTags(topic, category);

    return {
      id: uuidv4(),
      title: createTrendTitle(topic, group.headlines),
      description: `${mainHeadline.title} — a sign of shifts in how people think or behave around ${topic}.`,
      source: sourceType,
      platformTags,
      category,
      addedOn: new Date()
    };
  });
}

function groupHeadlinesByTopics(headlines: Headline[]): { topic: string, headlines: Headline[] }[] {
  const groups: { [key: string]: Headline[] } = {};

  headlines.forEach(headline => {
    const words = headline.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'have', 'what'].includes(word));

    const mainKeyword = words[0] || 'news';
    if (!groups[mainKeyword]) groups[mainKeyword] = [];
    groups[mainKeyword].push(headline);
  });

  return Object.entries(groups)
    .map(([topic, headlines]) => ({ topic, headlines }))
    .sort((a, b) => b.headlines.length - a.headlines.length);
}

function createTrendTitle(topic: string, headlines: Headline[]): string {
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  const titlePatterns = [
    `The ${capitalizedTopic} Shift`,
    `Inside ${capitalizedTopic}`,
    `${capitalizedTopic} Culture`,
    `${capitalizedTopic} Unpacked`,
    `Decoding ${capitalizedTopic}`,
    `The Rise of ${capitalizedTopic}`
  ];
  const patternIndex = headlines.length % titlePatterns.length;
  return titlePatterns[patternIndex];
}

function generateRelevantPlatformTags(topic: string, category: string): string[] {
  const tags: string[] = [];

  if (topic.match(/video|watch|stream/i)) tags.push('YouTube', 'TikTok');
  else if (topic.match(/photo|image|picture/i)) tags.push('Instagram', 'Pinterest');
  else if (topic.match(/news|politics|world/i)) tags.push('Twitter', 'News Apps');
  else if (topic.match(/business|work|career/i)) tags.push('LinkedIn', 'Twitter');
  else tags.push('Social Media');

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

  return [...new Set(tags)].slice(0, 3);
}

export function getCulturalTrends(): CulturalTrend[] {
  return allCulturalTrends;
}

export function saveCulturalTrends(trends: CulturalTrend[]) {
  console.log(`Saving ${trends.length} cultural trends to memory:`, trends);

  // ✅ Ensure we keep Reddit and NewsAPI separately
  const source = trends[0]?.source;
  allCulturalTrends = [
    ...allCulturalTrends.filter(t => t.source !== source),
    ...trends,
  ];

  try {
    localStorage.setItem("cultural_trends_cache", JSON.stringify(allCulturalTrends));
    console.log("Saved trends to localStorage");
  } catch (error) {
    console.error("Failed to save trends to localStorage:", error);
  }
}

export function getCachedCulturalTrends(): CulturalTrend[] {
  try {
    const cached = localStorage.getItem("cultural_trends_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
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
  return [];
}