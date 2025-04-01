// server/newsApi.ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { fetchNewsFromServer } from './fetchNewsTrends.server';
import { generateCulturalTrends } from '../src/lib/generateCulturalTrends';

dotenv.config();
const router = express.Router();

// ✅ Legacy route
router.get('/news', async (_req: Request, res: Response) => {
  try {
    const headlines = await fetchNewsFromServer();
    const trends = await generateCulturalTrends(headlines);
    res.json({ success: true, trends });
  } catch (error: any) {
    console.error("❌ Error in /api/news:", error);
    res.status(500).json({ error: error.message || "Failed to generate cultural trends" });
  }
});

// ✅ Primary API route
router.get('/news-trends', async (_req: Request, res: Response) => {
  try {
    const headlines = await fetchNewsFromServer();

    // Always treat them as raw headlines and convert
    const trends = await generateCulturalTrends(headlines);
    res.json(trends);
  } catch (error: any) {
    console.error("❌ Error in /api/news-trends:", error);
    res.status(500).json({ error: error.message || "Failed to fetch or process news trends" });
  }
});

export default router;