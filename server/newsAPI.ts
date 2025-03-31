// server/newsApi.ts
import express from 'express';
import dotenv from 'dotenv';
import { fetchNewsFromServer } from './fetchNewsTrends.server';
import { generateCulturalTrends, saveCulturalTrends } from '../src/lib/generateCulturalTrends';

dotenv.config();

const router = express.Router();

// GET /api/news
router.get('/news', async (req, res) => {
  try {
    const headlines = await fetchNewsFromServer();
    const trends = await generateCulturalTrends(headlines);

    // Save trends in memory + localStorage (handled internally)
    saveCulturalTrends(trends);

    res.json({ success: true, trends });
  } catch (error: any) {
    console.error("❌ Error in /api/news:", error);
    res.status(500).json({ error: error.message || "Failed to generate cultural trends" });
  }
});

export default router;