
import { Headline } from "./fetchNewsTrends.client";
import { CulturalTrend } from "./generateCulturalTrends";
import { v4 as uuidv4 } from "uuid";

export async function fetchNewsFromServer(): Promise<CulturalTrend[]> {
  console.log("🔍 Fetching news from server...");
  
  try {
    // First try to fetch from our own API endpoint
    console.log("📡 Trying to fetch from server API endpoint...");
    
    // Use absolute URL to ensure correct path resolution
    const baseUrl = window.location.origin;
    const apiResponse = await fetch(`${baseUrl}/api/news-trends`, {
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
      // The API returns an array of trends or headlines
      // Ensure all items are properly formatted as CulturalTrends
      return ensureCulturalTrendFormat(data);
    }
    
    throw new Error("Invalid data format returned from server");
  } catch (serverError) {
    console.error("❌ Server API failed:", serverError);
    
    // Fallback to direct API call (will only work on localhost)
    console.log("⚠️ Falling back to direct NewsAPI call (only works on localhost)");
    const apiKey = import.meta.env.VITE_NEWS_API_KEY || "ca7eb7fe6b614e7095719eb52b15f728";
    
    console.log("🔑 Using API key:", apiKey.substring(0, 5) + "...");
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
    
    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ NewsAPI response error:", errorData);
        throw new Error(errorData.message || "Failed to fetch from NewsAPI");
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.articles?.length || 0} articles from NewsAPI`);

      const headlines = data.articles.map((article: any) => ({
        title: article.title || "Untitled",
        source: article.source?.name || "Unknown Source",
        publishedAt: article.publishedAt || new Date().toISOString(),
      }));
      
      // Convert headlines to CulturalTrends format
      return convertHeadlinesToTrends(headlines);
    } catch (apiError) {
      console.error("❌ Direct NewsAPI call failed:", apiError);
      throw apiError;
    }
  }
}

// Helper function to ensure data is in CulturalTrend format
function ensureCulturalTrendFormat(data: any[]): CulturalTrend[] {
  return data.map(item => {
    // Check if item already has all CulturalTrend properties
    if (
      item.id && 
      item.title && 
      item.description && 
      item.source && 
      item.platformTags && 
      item.category && 
      item.addedOn
    ) {
      // Item is already a CulturalTrend, just ensure addedOn is a Date
      return {
        ...item,
        addedOn: item.addedOn instanceof Date ? item.addedOn : new Date(item.addedOn)
      };
    }
    
    // Item is a Headline or something else, convert to CulturalTrend
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

// Convert headlines to cultural trends
function convertHeadlinesToTrends(headlines: Headline[]): CulturalTrend[] {
  return headlines.map(headline => ({
    id: uuidv4(),
    title: headline.title,
    description: `News from ${headline.source}`,
    source: "NewsAPI",
    platformTags: ["News", "Current Events"],
    category: "News",
    addedOn: new Date()
  }));
}
