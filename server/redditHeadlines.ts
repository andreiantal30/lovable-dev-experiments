import express from "express";
const router = express.Router();
import fetch from "node-fetch";  // Use node-fetch for making HTTP requests.

const subreddits = [
  "GenZ",
  "trend",
  "OutOfTheLoop",
  "advertising",
  "marketing",
  "trendingsubreddits",
  "popular"
];

// In-memory cache to store Reddit headlines
let cachedHeadlines = [];
let lastFetched = 0; // Store the timestamp of the last fetch

// Helper function to check if cache is outdated (e.g., older than 24 hours)
function isCacheOutdated() {
  const oneDayInMillis = 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() - lastFetched > oneDayInMillis;
}

// Fetch Reddit headlines from Reddit API
async function fetchRedditHeadlines() {
  const allHeadlines: { title: string; source: string; publishedAt: string }[] = [];

  const results = await Promise.allSettled(
    subreddits.map(async (sub) => {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`;

      // Using the new app credentials
      const response = await fetch(url, {
        headers: {
          "User-Agent": "WriteawayTrendsBot-experimental/1.0 by Ok_Assistant8363",  // Updated User-Agent
        },
      });

      if (!response.ok) throw new Error(`Failed r/${sub} ${response.status}`);

      const data = await response.json();
      return data.data.children.map((post: any) => ({
        title: post.data.title,
        source: `r/${sub}`,
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
      }));
    })
  );

  // Log fetch success/failure per subreddit
  console.log("Settled results:", results.map((r, i) => `${subreddits[i]}: ${r.status}`));

  for (const result of results) {
    if (result.status === "fulfilled") {
      allHeadlines.push(...result.value);
    }
  }

  // Cache the headlines and update the timestamp
  cachedHeadlines = allHeadlines;
  lastFetched = Date.now();
  console.log("✅ Final Reddit headlines:", cachedHeadlines.length);
  return cachedHeadlines;
}

// Route to fetch Reddit headlines (manual trigger)
router.get("/reddit-headlines", async (_req, res) => {
  try {
    // Check if cache is outdated
    if (isCacheOutdated()) {
      console.log("Cache is outdated. Fetching new Reddit headlines...");
      await fetchRedditHeadlines();
    } else {
      console.log("Returning cached Reddit headlines.");
    }

    res.json(cachedHeadlines);
  } catch (error) {
    console.error("❌ Failed to fetch Reddit headlines:", error);
    res.status(500).json({ error: "Failed to fetch Reddit headlines" });
  }
});

export default router;
