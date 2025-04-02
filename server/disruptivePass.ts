import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';  // Ensure the correct import path
import type { Request, Response } from 'express';

const router = express.Router();

router.post('/disruptive-pass', async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaign } = req.body;
    
    if (!campaign) {
      res.status(400).json({ error: "Missing campaign data" });
      return;
    }

    const updatedCampaign = await injectDisruptiveDevice(campaign) as any;

    // Log to verify updated campaign data
    console.log("✅ Updated campaign data after disruptive pass:", updatedCampaign);

    const response = {
      campaignName: updatedCampaign.campaignName,
      keyMessage: updatedCampaign.keyMessage,
      prHeadline: updatedCampaign.prHeadline,  // Ensure prHeadline is included here
      viralHook: updatedCampaign.viralHook,
      executionPlan: updatedCampaign.executionPlan,
      creativeStrategy: updatedCampaign.creativeStrategy,
      callToAction: updatedCampaign.callToAction,
      expectedOutcomes: updatedCampaign.expectedOutcomes,
      consumerInteraction: updatedCampaign.consumerInteraction,
      viralElement: updatedCampaign.viralElement,
      creativeInsights: updatedCampaign.creativeInsights,
      evaluation: updatedCampaign.evaluation,
    };

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
