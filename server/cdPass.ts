// server/routes/cdPass.ts
import express from 'express';
import { applyCreativeDirectorPass } from './applyCreativeDirectorPass';
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/cd-pass', async (req: Request, res: Response): Promise<void> => {
  try {
    const campaign = req.body;

    if (!campaign || typeof campaign !== 'object') {
      res.status(400).json({ error: "Missing or invalid campaign data" });
      return;
    }

    const improved = await applyCreativeDirectorPass(campaign);
    res.status(200).json(improved);
  } catch (error) {
    console.error("❌ CD pass failed:", error);
    res.status(500).json({ 
      error: "CD pass failed", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;