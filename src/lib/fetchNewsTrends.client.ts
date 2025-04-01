
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
    // First try to fetch from our server endpoint
    console.log("Trying to fetch news from server endpoint...");
    
    const baseUrl = window.location.origin;
    
    try {
      const response = await fetch(`${baseUrl}/api/news-trends`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Successfully fetched news from server endpoint");
        
        if (Array.isArray(data) && data.length > 0) {
          // If the server returned processed trends or headlines
          return data.map((item: any) => ({
            title: item.title,
            source: typeof item.source === 'object' ? item.source.name : item.source,
            publishedAt: item.publishedAt
          }));
        } else {
          throw new Error("Invalid data format from server");
        }
      } else {
        console.error("Server endpoint error:", await response.text());
        throw new Error(`Server endpoint error: ${response.status}`);
      }
    } catch (serverError) {
      console.error("Backend API fetch failed:", serverError);
      throw new Error("Server endpoint unavailable");
    }
  } catch (error) {
    console.error("Error fetching news trends:", error);
    
    // Check if this is a CORS error
    if (error instanceof Error && error.message.includes("CORS")) {
      toast.error("NewsAPI doesn't allow browser requests. Please run locally or use the server endpoint.");
    } else {
      toast.error("Failed to fetch news trends");
    }
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
