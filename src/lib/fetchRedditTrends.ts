import snoowrap from "snoowrap";
import { generateCulturalTrends } from "./generateCulturalTrends";
import { Headline } from "./fetchNewsTrends";

const reddit = new snoowrap({
  userAgent: "WriteawayTrendsBot/1.0 by Andrei",
  clientId: import.meta.env.VITE_REDDIT_CLIENT_ID,
  clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET,
  refreshToken: import.meta.env.VITE_REDDIT_REFRESH_TOKEN,
});

const subreddits = ["GenZ", "trend", "OutOfTheLoop", "advertising", "marketing"];

export async function fetchAndGenerateRedditTrends() {
  try {
    const allHeadlines: Headline[] = [];

    for (const sub of subreddits) {
      const posts = await reddit.getSubreddit(sub).getHot({ limit: 10 });
    
      posts.forEach((post) => {
        allHeadlines.push({
          title: post.title,
          source: `r/${sub}`
        });
      });
    }
    
    console.log("🧵 Pulled Reddit headlines:", allHeadlines.length);

    const culturalTrends = await generateCulturalTrends(allHeadlines);
    return culturalTrends;
  } catch (error) {
    console.error("🚨 Error fetching Reddit trends:", error);
    throw error;
  }
}