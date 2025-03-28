
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
  try {
    // First try to get the key from localStorage
    let apiKey = localStorage.getItem(NEWS_API_STORAGE_KEY);
    
    // If not in localStorage, try to use the environment variable as fallback
    if (!apiKey) {
      apiKey = import.meta.env.VITE_NEWS_API_KEY;
      
      if (apiKey) {
        // Save it to localStorage for future use
        localStorage.setItem(NEWS_API_STORAGE_KEY, apiKey);
        console.log("Using NewsAPI key from environment variables");
      } else {
        toast.error("NewsAPI key is not set. Please set it in the settings.");
        throw new Error("NewsAPI key is not set");
      }
    }

    console.log("Fetching news with API key:", apiKey.substring(0, 5) + "...");
    
    // Try to fetch from our own backend API first
    try {
      const response = await fetch("/api/news-trends");
      if (response.ok) {
        const data = await response.json();
        return data.map((article: any) => ({
          title: article.title,
          source: article.source.name,
          publishedAt: article.publishedAt
        }));
      }
    } catch (err) {
      console.log("Backend API fetch failed, trying direct NewsAPI...");
    }
    
    // If backend fails, try direct API access with the key
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
  // Try to get from localStorage first
  const localKey = localStorage.getItem(NEWS_API_STORAGE_KEY);
  if (localKey) return localKey;
  
  // If not in localStorage, try env variable
  const envKey = import.meta.env.VITE_NEWS_API_KEY;
  if (envKey) {
    // Save to localStorage for future use
    localStorage.setItem(NEWS_API_STORAGE_KEY, envKey);
    return envKey;
  }
  
  return "";
};
