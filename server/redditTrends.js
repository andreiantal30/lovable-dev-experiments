import snoowrap from "snoowrap";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const reddit = new snoowrap({
  userAgent: "WriteawayTrendsBot/1.0 by Andrei",
  clientId: process.env.VITE_REDDIT_CLIENT_ID,
  clientSecret: process.env.VITE_REDDIT_CLIENT_SECRET,
  refreshToken: process.env.VITE_REDDIT_REFRESH_TOKEN,
});

const subreddits = ["GenZ", "trend", "OutOfTheLoop", "advertising", "marketing"];

async function fetchRedditTrends() {
  const headlines = [];

  for (const sub of subreddits) {
    const posts = await reddit.getSubreddit(sub).getHot({ limit: 10 });
    posts.forEach((post) => {
      headlines.push({
        title: post.title,
        source: `r/${sub}`,
      });
    });
  }

  // Save it locally (or print to console)
  fs.writeFileSync("./reddit-headlines.json", JSON.stringify(headlines, null, 2));
  console.log("✅ Saved Reddit headlines to reddit-headlines.json");
}

fetchRedditTrends().catch(console.error);
