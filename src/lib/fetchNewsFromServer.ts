
import { Headline } from "./fetchNewsTrends.client";

export async function fetchNewsFromServer(): Promise<Headline[]> {
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
      return data;
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

      return data.articles.map((article: any) => ({
        title: article.title || "Untitled",
        source: article.source?.name || "Unknown Source",
        publishedAt: article.publishedAt || new Date().toISOString(),
      }));
    } catch (apiError) {
      console.error("❌ Direct NewsAPI call failed:", apiError);
      throw apiError;
    }
  }
}
