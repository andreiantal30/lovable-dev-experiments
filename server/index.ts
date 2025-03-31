// server/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import newsApiRouter from "./newsApi";     // ✅ NewsAPI route
import cdPassRoute from "./cdPass";        // ✅ Creative Director Pass route

const app = express();
const port = 8090;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Mount API routes
app.use('/api', newsApiRouter);   // → /api/news
app.use('/api', cdPassRoute);     // → /api/cd-pass

// Optional: Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`🧠 Backend server running at http://localhost:${port}`);
});