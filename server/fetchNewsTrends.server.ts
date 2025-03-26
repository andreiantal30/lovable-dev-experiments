import { config } from "dotenv";
import type { Headline } from "@/lib/fetchNewsTrends.client";

// Load API key from .env
config();

export async function fetchNewsFromServer(): Promise<Headline[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY in .env");
  }

  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch news trends");
  }

  const data = await response.json();

  return data.articles.map((article: any) => ({
    title: article.title,
    source: article.source.name,
    publishedAt: article.publishedAt,
  }));
}
