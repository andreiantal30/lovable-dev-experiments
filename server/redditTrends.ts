// server/redditTrends.ts
import express from "express";
import { generateCulturalTrends } from "../src/lib/generateCulturalTrends";
import type { Headline } from "../src/lib/fetchNewsTrends.client"; // ✅ reuse types if needed

const router = express.Router();

const subreddits = ["GenZ", "trend", "OutOfTheLoop", "advertising", "marketing", "trendingsubreddits", "popular"];

router.get("/api/reddit-trends", async (_req, res) => {
  try {
    const allHeadlines: Headline[] = [];

    for (const sub of subreddits) {
      try {
        const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`);
        if (!response.ok) continue;

        const data = await response.json();
        const posts = data.data.children;

        posts.forEach((post: any) => {
          allHeadlines.push({
            title: post.data.title,
            source: `r/${sub}`,
            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
          });
        });

        if (allHeadlines.length >= 30) break;
      } catch (err) {
        console.error(`❌ Subreddit failed: r/${sub}`, err);
      }
    }

    if (allHeadlines.length === 0) {
      return res.status(500).json({ error: "No Reddit headlines fetched" });
    }

    const culturalTrends = await generateCulturalTrends(allHeadlines);
    const redditTrends = culturalTrends.map(trend => ({ ...trend, source: "Reddit" }));

    res.json(redditTrends);
  } catch (err) {
    console.error("❌ Reddit Trends API error:", err);
    res.status(500).json({ error: "Failed to fetch Reddit trends" });
  }
});

export default router;
