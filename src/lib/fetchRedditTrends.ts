import snoowrap from 'snoowrap';
import { generateCulturalTrends, CulturalTrend } from './generateCulturalTrends';
import { saveCulturalTrends } from './generateCulturalTrends';

const reddit = new snoowrap({
  userAgent: 'writeaway2-agent',
  clientId: import.meta.env.VITE_REDDIT_CLIENT_ID,
  clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET,
  refreshToken: import.meta.env.VITE_REDDIT_REFRESH_TOKEN,
});

// List of subreddits to monitor
const SUBREDDITS = ['GenZ', 'trend', 'OutOfTheLoop', 'marketing', 'advertising'];

export async function fetchAndGenerateRedditTrends(): Promise<CulturalTrend[]> {
  const allHeadlines: { title: string; source: string }[] = [];

  for (const sub of SUBREDDITS) {
    const posts = await reddit.getSubreddit(sub).getHot({ limit: 5 });
    posts.forEach(post => {
      allHeadlines.push({ title: post.title, source: `r/${sub}` });
    });
  }

  const trends = await generateCulturalTrends(allHeadlines);
  saveCulturalTrends(trends); // optional, can also do this from UI
  return trends;
}
