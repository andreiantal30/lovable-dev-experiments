import { fetchNewsFromServer } from "../../server/fetchNewsTrends.server";
import { generateCulturalTrends } from "@/lib/generateCulturalTrends";

export interface Headline {
  title: string;
  source: string;
  publishedAt: string;
}

export const fetchNewsTrends = async (): Promise<Headline[]> => {
  const response = await fetch("/api/news-trends");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch news trends");
  }

  return response.json();
};