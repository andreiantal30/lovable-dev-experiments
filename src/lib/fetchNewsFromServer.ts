import { Headline } from "./fetchNewsTrends.client";
import { CulturalTrend } from "./generateCulturalTrends";
import { v4 as uuidv4 } from "uuid";

export async function fetchNewsFromServer(): Promise<CulturalTrend[]> {
  console.log("🔍 Fetching news from server...");

  try {
    // ✅ Always fetch from internal backend proxy route (not directly from NewsAPI)
    console.log("📡 Fetching from internal API route /api/news...");

    const response = await fetch("/api/news", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error: ${response.status}`, errorText);
      throw new Error(`API response error: ${response.status}`);
    }

    const articles = await response.json();
    console.log(`✅ Received ${articles.length} articles from internal API`);

    const headlines: Headline[] = articles.map((article: any) => ({
      title: article.title || "Untitled",
      source: article.source?.name || "Unknown Source",
      publishedAt: article.publishedAt || new Date().toISOString(),
    }));

    return convertHeadlinesToTrends(headlines);
  } catch (error) {
    console.error("❌ Failed to fetch from internal API:", error);
    throw error; // stop here — no NewsAPI fallback in production
  }
}

// Convert headlines to cultural trends
function convertHeadlinesToTrends(headlines: Headline[]): CulturalTrend[] {
  return headlines.map((headline) => ({
    id: uuidv4(),
    title: headline.title,
    description: `News from ${headline.source}`,
    source: "NewsAPI",
    platformTags: ["News", "Current Events"],
    category: "News",
    addedOn: new Date(),
  }));
}