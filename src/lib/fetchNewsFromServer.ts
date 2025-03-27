<<<<<<< HEAD
export async function fetchNewsFromServer() {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY; // use your .env
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const json = await response.json();
    return json.articles;
  }
  
=======
import { Headline } from "./fetchNewsTrends.client";

export async function fetchNewsFromServer(): Promise<Headline[]> {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not set in environment");
  }

  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch from NewsAPI");
  }

  const data = await response.json();

  return data.articles.map((article: any) => ({
    title: article.title,
    source: article.source.name,
    publishedAt: article.publishedAt,
  }));
}
