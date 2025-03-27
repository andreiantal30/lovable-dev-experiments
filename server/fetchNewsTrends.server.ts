import "dotenv/config";
import { Headline } from "../src/lib/fetchNewsTrends.client";

export const fetchNewsFromServer = async (): Promise<Headline[]> => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("❌ NEWS_API_KEY is not defined in .env");
  }

  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch news trends");
  }

  const data = await response.json();
  return data.articles.map((article: any) => ({
    title: article.title,
    source: article.source.name,
    publishedAt: article.publishedAt,
  }));
};
