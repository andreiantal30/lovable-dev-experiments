import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/disruptive-pass', async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaign } = req.body;

    if (!campaign || typeof campaign !== 'object') {
      res.status(400).json({ error: "Missing or invalid campaign data" });
      return;
    }

    const injected = await injectDisruptiveDevice(campaign);

    if (!injected || typeof injected !== 'object') {
      console.error("⚠️ Disruptive device injection returned invalid output");
      res.status(500).json({ error: "Disruptive injection failed" });
      return;
    }

    const response = {
      ...campaign,
      ...injected, // ✅ Merge enhanced output
    };

    console.log("✅ Disruptive device injected successfully.");
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Disruptive pass failed:");
    console.error(error instanceof Error ? error.stack : error);

    res.status(500).json({ 
      error: "Disruptive pass failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;