
import { generateCulturalTrends } from "./generateCulturalTrends";
import { Headline } from "./fetchNewsTrends";

// We'll use the public Reddit JSON API instead of snoowrap
const subreddits = ["GenZ", "trend", "OutOfTheLoop", "advertising", "marketing"];

export async function fetchAndGenerateRedditTrends(): Promise<any[]> {
  try {
    const allHeadlines: Headline[] = [];

    for (const sub of subreddits) {
      try {
        // Fetch the hot posts from the subreddit using the public JSON API
        const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`);
        
        if (!response.ok) {
          console.error(`Error fetching from r/${sub}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Extract the posts from the response
        const posts = data.data.children;
        
        posts.forEach((post: any) => {
          allHeadlines.push({
            title: post.data.title,
            source: `r/${sub}`,
            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
          });
        });
      } catch (error) {
        console.error(`Error processing r/${sub}:`, error);
        // Continue with other subreddits even if one fails
      }
    }

    console.log("📥 Pulled Reddit headlines:", allHeadlines.length);

    if (allHeadlines.length === 0) {
      throw new Error("No Reddit headlines were fetched");
    }

    const culturalTrends = await generateCulturalTrends(allHeadlines);
    return culturalTrends;
  } catch (error) {
    console.error("❌ Error fetching Reddit trends:", error);
    throw error;
  }
}
