import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';
import cors from 'cors';  // Make sure CORS is imported
import type { Request, Response } from 'express';

const router = express.Router();

// CORS handling
router.options('*', cors());  // Handle preflight requests
router.post('/disruptive-pass', async (req: Request, res: Response): Promise<void> => {
  console.log('Received request for disruptive pass:', req.body);  // Logging the request

  try {
    const { campaign } = req.body;
    
    // Validate campaign data
    if (!campaign || typeof campaign !== 'object') {
      res.status(400).json({ error: "Missing or invalid campaign data" });
      return;
    }

    // Inject disruptive device into the campaign
    const injected = await injectDisruptiveDevice(campaign);

    // Validate injected data
    if (!injected || typeof injected !== 'object') {
      console.error("⚠️ Disruptive device injection returned invalid output");
      res.status(500).json({ error: "Disruptive injection failed" });
      return;
    }

    // Log the response before sending
    const response = {
      ...campaign,
      ...injected, // Merge enhanced output
    };
    
    console.log("✅ Disruptive device injected successfully. Response:", response); // Log response

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Disruptive pass failed:");
    console.error(error instanceof Error ? error.stack : error);

    // Send error response
    res.status(500).json({ 
      error: "Disruptive pass failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
