// server/disruptivePass.ts
import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/disruptive-pass', async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaign } = req.body;

    if (!campaign) {
      res.status(400).json({ error: "Missing campaign data" });
      return;
    }

    const updatedCampaign = await injectDisruptiveDevice(campaign);

    // Ensure the response includes prHeadline and other relevant data
    const response = {
      campaignName: updatedCampaign.campaignName,
      keyMessage: updatedCampaign.keyMessage,
      prHeadline: updatedCampaign.prHeadline, // Ensure prHeadline is included here
      viralHook: updatedCampaign.viralHook, // If this exists on updatedCampaign
      // Other properties if needed
      evaluation: updatedCampaign.evaluation, // Assuming this is being added to the campaign
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Disruptive pass failed:", error);
    res.status(500).json({ error: "Disruptive pass failed" });
  }
});

export default router;