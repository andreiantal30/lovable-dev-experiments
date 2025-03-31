// server/newsApi.ts
import express from 'express';
import dotenv from 'dotenv';
import { fetchNewsFromServer } from './fetchNewsTrends.server';
import { generateCulturalTrends, saveCulturalTrends } from '../src/lib/generateCulturalTrends';

dotenv.config();
const router = express.Router();

// ✅ Old route (optional, can keep for legacy)
router.get('/news', async (req, res) => {
  try {
    const headlines = await fetchNewsFromServer();
    const trends = await generateCulturalTrends(headlines);
    saveCulturalTrends(trends);
    res.json({ success: true, trends });
  } catch (error: any) {
    console.error("❌ Error in /api/news:", error);
    res.status(500).json({ error: error.message || "Failed to generate cultural trends" });
  }
});

// ✅ ✅ NEW route that matches frontend call to /api/news-trends
router.get('/news-trends', async (req, res) => {
  try {
    const headlines = await fetchNewsFromServer();

    // If headlines already contain trends, return directly
    if (headlines[0]?.title && headlines[0]?.platformTags) {
      return res.json(headlines); // already formatted as CulturalTrend[]
    }

    // Otherwise, treat them as raw headlines and generate trends
    const trends = await generateCulturalTrends(headlines);
    res.json(trends); // plain CulturalTrend[]
  } catch (error: any) {
    console.error("❌ Error in /api/news-trends:", error);
    res.status(500).json({ error: error.message || "Failed to fetch or process news trends" });
  }
});

export default router;