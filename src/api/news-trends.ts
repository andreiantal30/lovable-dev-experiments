
import { fetchNewsFromServer } from "@/lib/fetchNewsFromServer";
import { generateCulturalTrends } from "@/lib/generateCulturalTrends";

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
    
    const headlines = data.articles.map((article: any) => ({
      title: article.title,
      source: article.source.name,
      publishedAt: article.publishedAt,
    }));
    
    const trends = await generateCulturalTrends(headlines);
    console.log(`🧠 Generated ${trends.length} cultural trends`);

    return new Response(JSON.stringify(trends), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate news trends", details: String(e) }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
