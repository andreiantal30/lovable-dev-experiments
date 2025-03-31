// server/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import newsApiRouter from "./newsApi"; // ✅ must match file exactly

const app = express();
const port = 8090;

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Mount the NewsAPI router at /api
app.use('/api', newsApiRouter); // This makes /api/news available

// Optional: Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`🧠 Backend server running at http://localhost:${port}`);
});