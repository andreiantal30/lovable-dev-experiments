import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { fetchNewsFromServer } from "./fetchNewsTrends.server.ts";
import { generateCulturalTrends } from "../src/lib/generateCulturalTrends.ts";

const app = express();
const port = 8090;

app.use(cors());

app.get("/api/news-trends", async (_req, res) => {
  try {
    const headlines = await fetchNewsFromServer();
    const trends = await generateCulturalTrends(headlines);
    res.json(trends);
  } catch (e) {
    console.error("❌ News API error:", e);
    res.status(500).json({ error: "Failed to fetch news trends", details: e });
  }
});

app.listen(port, () => {
  console.log(`🧠 Backend server running at http://localhost:${8082}`);
});