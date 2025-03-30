
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
    
    // If not in localStorage, use the default key
    if (!apiKey) {
      apiKey = "ca7eb7fe6b614e7095719eb52b15f728";
      // Save it to localStorage for future use
      localStorage.setItem(NEWS_API_STORAGE_KEY, apiKey);
      console.log("Using default NewsAPI key");
    }

    console.log("Fetching news with API key:", apiKey.substring(0, 5) + "...");
    
    // Make direct API request to NewsAPI
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("NewsAPI error:", errorData);
      
      if (errorData.code === "apiKeyInvalid" || errorData.code === "apiKeyExhausted" || errorData.code === "apiKeyMissing") {
        toast.error("Invalid or expired NewsAPI key. Using default key.");
        localStorage.removeItem(NEWS_API_STORAGE_KEY);
        return fetchNewsTrends(); // Retry with default key
      }
      
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
  
  // If not in localStorage, use default key
  return "ca7eb7fe6b614e7095719eb52b15f728";
};
