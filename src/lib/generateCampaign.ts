import { toast } from "sonner";
import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig, evaluateCampaign } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignEvaluation, CampaignVersion } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generateCreativeInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';

const applyCreativeDirectorPass = async (rawOutput: any) => {
  try {
    const res = await fetch('/api/cd-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawOutput),
    });
    
    if (!res.ok) {
      console.error(`CD pass API error: ${res.status}`);
      return rawOutput; // Return original if API fails
    }
    
    return await res.json();
  } catch (err) {
    console.error("CD pass failed:", err);
    return rawOutput;
  }
};

export const generateCampaign = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    const creativeInsights = await generateCreativeInsights(input, openAIConfig);
    console.log("Generated Creative Insights:", creativeInsights);

    const referenceCampaigns = await findSimilarCampaigns(input, openAIConfig);
    console.log("Matched Reference Campaigns:", referenceCampaigns.map(c => ({
      name: c.name,
      brand: c.brand,
      industry: c.industry
    })));

    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    console.log("Selected Creative Devices:", creativeDevices.map(d => d.name));

    const culturalTrends = getCachedCulturalTrends();
    const prioritized = [
      ...culturalTrends.filter(t =>
        !t.platformTags.some(tag => tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar") || tag.toLowerCase().includes("vr") || tag.toLowerCase().includes("metaverse"))
      ),
      ...culturalTrends.filter(t =>
        t.platformTags.some(tag => tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar"))
      )
    ];
    const relevantTrends = prioritized.sort(() => Math.random() - 0.5).slice(0, 3);
    if (relevantTrends.length > 0) {
      console.log("Incorporating Cultural Trends:", relevantTrends.map(t => t.title));
    }

    const prompt = createCampaignPrompt(
      input, referenceCampaigns, creativeInsights, creativeDevices, relevantTrends
    );
    console.log("Prompt Preview (first 200 chars):", prompt.substring(0, 200));

    const response = await generateWithOpenAI(prompt, openAIConfig);
    const cleanedResponse = extractJsonFromResponse(response);
    const generatedContent = JSON.parse(cleanedResponse);

    // ✏️ CD pass
    let improvedContent = generatedContent;
    try {
      improvedContent = await applyCreativeDirectorPass(generatedContent);
      console.log("✅ CD pass applied");
    } catch (err) {
      console.error("⚠️ CD pass failed:", err);
    }

    // 💥 Disruptive Device pass
    let finalContent = improvedContent;
    const payload = { campaign: improvedContent };
    console.log("📦 Payload sent to /api/disruptive-pass:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch('/api/disruptive-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Disruptive pass API error: ${res.status}`);
      }

      const jsonResponse = await res.json();
      finalContent = jsonResponse;
      console.log("🎯 Disruptive twist added");
    } catch (err) {
      console.error("⚠️ Disruptive device injection failed:", err);
      toast.error("Disruptive enhancement failed, using base campaign");
    }

    const campaign: GeneratedCampaign = {
      ...finalContent,
      prHeadline: finalContent.prHeadline, // Make sure prHeadline is included here
      referenceCampaigns,
      creativeInsights,
      evaluation: finalContent.evaluation // Ensuring the evaluation (CD feedback) is included in the final campaign
    };

    // 📖 Storytelling generation
    try {
      const storytelling = await generateStorytellingNarrative({
        brand: input.brand,
        industry: input.industry,
        targetAudience: input.targetAudience,
        emotionalAppeal: input.emotionalAppeal,
        campaignName: campaign.campaignName,
        keyMessage: campaign.keyMessage
      }, openAIConfig);
      campaign.storytelling = storytelling;
    } catch (error) {
      console.error("Error generating storytelling content:", error);
      toast.error("Error generating storytelling content");
    }

    // 🧠 Evaluation
    try {
      const evaluation: CampaignEvaluation = await evaluateCampaign(campaign, openAIConfig);
      campaign.evaluation = evaluation;
      console.log("🧠 CD Evaluation injected:", evaluation);
    } catch (error) {
      console.error("❌ Campaign evaluation failed:", error);
      campaign.evaluation = {
        insightSharpness: 5,
        ideaOriginality: 5,
        executionPotential: 5,
        awardPotential: 5,
        finalVerdict: "Evaluation could not be processed correctly."
      };
    }

    console.log("🚀 Final campaign object being returned:", campaign);

    return campaign;
  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };