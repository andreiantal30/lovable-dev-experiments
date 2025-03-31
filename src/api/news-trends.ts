
import { fetchNewsFromServer } from "@/lib/fetchNewsFromServer";
import { generateCulturalTrends, CulturalTrend } from "@/lib/generateCulturalTrends";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    console.log("⚡ API endpoint: Fetching news trends...");
    
    // Direct server-side call to NewsAPI using environment variable
    const apiKey = import.meta.env.VITE_NEWS_API_KEY || "ca7eb7fe6b614e7095719eb52b15f728";
    console.log("🔑 Using API key:", apiKey.substring(0, 5) + "...");
    
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch from NewsAPI");
    }
    
    const data = await response.json();
    console.log(`📰 Fetched ${data.articles.length} headlines from NewsAPI`);
    
    // Map to consistent format
    const headlines = data.articles.map((article: any) => ({
      title: article.title || "Untitled",
      source: article.source?.name || "Unknown Source",
      publishedAt: article.publishedAt || new Date().toISOString(),
    }));
    
    const trends = await generateCulturalTrends(headlines);
    console.log(`🧠 Generated ${trends.length} cultural trends`);
    
    // Ensure each trend follows the CulturalTrend interface
    const formattedTrends: CulturalTrend[] = trends.map(trend => ({
      id: trend.id || uuidv4(),
      title: trend.title,
      description: trend.description,
      source: trend.source || "NewsAPI",
      platformTags: trend.platformTags || [],
      category: trend.category || "Uncategorized",
      addedOn: trend.addedOn instanceof Date ? trend.addedOn : new Date(),
    }));

    return new Response(JSON.stringify(formattedTrends), {
      headers: { 
        "Content-Type": "application/json",
        // Add CORS headers to allow browser requests
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      status: 200,
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate news trends", details: String(e) }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          // Add CORS headers to allow error responses
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    status: 204
  });
}
