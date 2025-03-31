// server/newsApi.ts
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import newsRouter from './newsApi';

app.use('/api', newsRouter); // This makes your route available at /api/news

dotenv.config();

const router = express.Router();

router.get('/news', async (req, res) => {
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching NewsAPI:", error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router;