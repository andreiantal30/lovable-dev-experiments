
import { Headline } from "./fetchNewsTrends.client";

export async function fetchNewsFromServer(): Promise<Headline[]> {
  console.log("🔍 Fetching news from server...");
  
  // First try to use the environment variable
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    console.error("❌ NEWS_API_KEY is not set in environment");
    throw new Error("NEWS_API_KEY is not set in environment");
  }

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
      title: article.title,
      source: article.source.name,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error("❌ Error in fetchNewsFromServer:", error);
    throw error;
  }
}
