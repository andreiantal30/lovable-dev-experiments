import { Headline } from "./fetchNewsTrends.client";
import { CulturalTrend } from "./generateCulturalTrends";
import { v4 as uuidv4 } from "uuid";

export async function fetchNewsFromServer(): Promise<CulturalTrend[]> {
  console.log("🔍 Fetching news from server...");

  try {
    // ✅ Use relative path instead of window.location.origin
    const apiResponse = await fetch(`/api/news-trends`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!apiResponse.ok) {
      console.error(`❌ API response error: ${apiResponse.status}`);
      const errorText = await apiResponse.text();
      console.error("Error response:", errorText);
      throw new Error(`API response error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log(`✅ Fetched data from server API: ${JSON.stringify(data).substring(0, 100)}...`);

    if (Array.isArray(data)) {
      return ensureCulturalTrendFormat(data);
    }

    throw new Error("Invalid data format returned from server");
  } catch (serverError) {
    console.error("❌ Server API failed:", serverError);
    throw serverError;
  }
}

// Helper function to ensure data is in CulturalTrend format
function ensureCulturalTrendFormat(data: any[]): CulturalTrend[] {
  return data.map(item => {
    return {
      id: item.id || uuidv4(),
      title: item.title || "Untitled",
      description: item.description || `News from ${item.source || "unknown source"}`,
      source: typeof item.source === 'string' ? item.source : (item.source?.name || "NewsAPI"),
      platformTags: item.platformTags || ["News", "Current Events"],
      category: item.category || "News",
      addedOn: item.addedOn ? new Date(item.addedOn) : new Date()
    };
  });
}