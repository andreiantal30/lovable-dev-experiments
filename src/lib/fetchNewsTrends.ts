
import { toast } from "sonner";

const NEWS_API_STORAGE_KEY = "news_api_key";

// Types for the API response
interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: {
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }[];
}

// Simplified headline format
export interface Headline {
  title: string;
  source: string;
  publishedAt: string;
}

/**
 * Fetch top headlines from NewsAPI
 */
export const fetchNewsTrends = async (): Promise<Headline[]> => {
  const apiKey = localStorage.getItem(NEWS_API_STORAGE_KEY);
  
  if (!apiKey) {
    toast.error("NewsAPI key is not set. Please set it in the settings.");
    throw new Error("NewsAPI key is not set");
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("NewsAPI error:", errorData);
      throw new Error(errorData.message || "Failed to fetch news trends");
    }
    
    const data: NewsApiResponse = await response.json();
    
    // Map to simplified format
    return data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));
  } catch (error) {
    console.error("Error fetching news trends:", error);
    toast.error("Failed to fetch news trends");
    throw error;
  }
};

/**
 * Save API key to localStorage
 */
export const saveNewsApiKey = (apiKey: string): void => {
  localStorage.setItem(NEWS_API_STORAGE_KEY, apiKey);
  toast.success("NewsAPI key saved successfully");
};

/**
 * Get API key from localStorage
 */
export const getNewsApiKey = (): string => {
  return localStorage.getItem(NEWS_API_STORAGE_KEY) || "";
};
