
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { fetchNewsFromServer } from "./fetchNewsTrends.server.ts";
import { generateCulturalTrends } from "../src/lib/generateCulturalTrends.ts";
import newsApiRouter from './newsApi';
app.use('/api/news', newsApiRouter);

const app = express();
const port = 8090;

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/api/news-trends", async (_req, res) => {
  try {
    console.log("📰 API: Fetching news trends...");
    const headlines = await fetchNewsFromServer();
    console.log(`📰 API: Fetched ${headlines.length} headlines`);
    
    const trends = await generateCulturalTrends(headlines);
    console.log(`🧠 API: Generated ${trends.length} cultural trends`);
    
    res.json(trends);
  } catch (e) {
    console.error("❌ News API error:", e);
    res.status(500).json({ error: "Failed to fetch news trends", details: String(e) });
  }
});

// Explicitly handle OPTIONS requests for CORS preflight
app.options("/api/news-trends", (_req, res) => {
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`🧠 Backend server running at http://localhost:${port}`);
});
