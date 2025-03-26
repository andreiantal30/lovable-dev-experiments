
import { v4 as uuidv4 } from "uuid";
import { generateWithOpenAI, defaultOpenAIConfig } from "./openai";
import { toast } from "sonner";
import { CulturalTrend } from "@/data/culturalTrends";

interface RedditPost {
  title: string;
  subreddit: string;
  score: number;
  num_comments: number;
}

/**
 * Fetches top posts from specified subreddits
 */
export async function fetchRedditTrends(): Promise<RedditPost[]> {
  const subreddits = ["GenZ", "trend", "OutOfTheLoop", "advertising", "marketing"];
  const allPosts: RedditPost[] = [];
  
  try {
    // Fetch posts from each subreddit
    const fetchPromises = subreddits.map(async (subreddit) => {
      try {
        console.log(`Fetching posts from r/${subreddit}...`);
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from r/${subreddit}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract relevant post data
        const posts = data.data.children.map((child: any) => ({
          title: child.data.title,
          subreddit: child.data.subreddit,
          score: child.data.score,
          num_comments: child.data.num_comments
        }));
        
        return posts;
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
        return [];
      }
    });
    
    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);
    
    // Flatten the array of arrays
    results.forEach(posts => {
      allPosts.push(...posts);
    });
    
    console.log(`Fetched ${allPosts.length} posts from Reddit`);
    return allPosts;
  } catch (error) {
    console.error("Error fetching Reddit trends:", error);
    throw error;
  }
}

/**
 * Generate cultural trends based on Reddit posts using OpenAI
 */
export async function generateRedditTrends(posts: RedditPost[]): Promise<CulturalTrend[]> {
  try {
    // Format posts for the prompt
    const formattedPosts = posts
      .map(post => `- "${post.title}" (r/${post.subreddit})`)
      .join("\n");
    
    // Create the prompt for OpenAI
    const prompt = `
Based on the Reddit posts below, identify 3 cultural or behavioral trends.

For each trend, return:
- Title
- Cultural or behavioral insight
- Why it matters for brands
- Source: Reddit

Reddit posts:
${formattedPosts}

Please respond in a parseable JSON format only, with no explanation or additional text:
[
  {
    "title": "Trend title",
    "description": "Detailed description including the cultural insight and why it matters",
    "category": "Category",
    "platformTags": ["Tag1", "Tag2", "Tag3"]
  },
  ...
]
`;

    console.log("Sending prompt to OpenAI:", prompt.substring(0, 200) + "...");
    
    // Send to OpenAI
    const response = await generateWithOpenAI(prompt, defaultOpenAIConfig);
    
    // Parse the response
    try {
      const jsonResponse = JSON.parse(response);
      
      if (!Array.isArray(jsonResponse)) {
        throw new Error("Response is not an array");
      }
      
      // Transform to our format with IDs and dates
      return jsonResponse.map(trend => ({
        id: uuidv4(),
        title: trend.title,
        description: trend.description,
        source: "Reddit",
        platformTags: trend.platformTags || [],
        category: trend.category || "Uncategorized",
        addedOn: new Date()
      }));
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", response);
      toast.error("Failed to parse trends from AI response");
      throw new Error("Failed to parse cultural trends");
    }
  } catch (error) {
    console.error("Error generating Reddit trends:", error);
    throw error;
  }
}

/**
 * Fetch Reddit posts and generate trends in one function
 */
export async function fetchAndGenerateRedditTrends(): Promise<CulturalTrend[]> {
  try {
    const posts = await fetchRedditTrends();
    return await generateRedditTrends(posts);
  } catch (error) {
    console.error("Error in fetchAndGenerateRedditTrends:", error);
    throw error;
  }
}
