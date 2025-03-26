import snoowrap from "snoowrap";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();


const reddit = new snoowrap({
    userAgent: "WriteawayTrendsBot/1.0 by Andrei",
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });
  

const subreddits = ['GenZ', 'trend', 'OutOfTheLoop', 'advertising', 'marketing'];

async function fetchRedditHeadlines() {
  const allHeadlines = [];

  for (const sub of subreddits) {
    const posts = await reddit.getSubreddit(sub).getHot({ limit: 10 });
    posts.forEach((post) => {
      allHeadlines.push({
        title: post.title,
        source: `r/${sub}`,
      });
    });
  }

  // Save to file or log
  fs.writeFileSync('./server/reddit-trends.json', JSON.stringify(allHeadlines, null, 2));
  console.log(`✅ Saved ${allHeadlines.length} headlines to reddit-trends.json`);
}

fetchRedditHeadlines().catch(console.error);

console.log("Loaded credentials:", process.env.VITE_REDDIT_CLIENT_ID);
