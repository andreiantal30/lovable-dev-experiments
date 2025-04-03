import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import newsApiRouter from "./newsApi";
import cdPassRoute from "./cdPass";
import disruptivePassRoute from "./disruptivePass";

const app = express();
const port = 8090;

// ✅ Set CORS for your frontend Codespace URL
app.use(cors({
  origin: 'https://animated-capybara-jj9qrx9r77pwc5qwj-8080.app.github.dev',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // only needed if you're using cookies or auth headers
}));

// ✅ Preflight support
app.options('*', cors());

app.use(express.json());

app.use('/api', newsApiRouter);       // → /api/news
app.use('/api', cdPassRoute);         // → /api/cd-pass
app.use('/api', disruptivePassRoute); // → /api/disruptive-pass

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🧠 Backend server running at http://localhost:${port}`);
});
