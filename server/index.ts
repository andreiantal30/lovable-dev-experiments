// server/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import newsApiRouter from "./newsApi";
import cdPassRoute from "./cdPass";
import disruptivePassRoute from './disruptivePass';

const app = express();
const port = 8090;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', newsApiRouter);       // → /api/news
app.use('/api', cdPassRoute);         // → /api/cd-pass
app.use('/api', disruptivePassRoute); // → /api/disruptive-pass

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🧠 Backend server running at http://localhost:${port}`);
});