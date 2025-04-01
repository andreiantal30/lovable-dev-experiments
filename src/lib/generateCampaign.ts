
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
    return rawOutput; // Return original if API fails
  }
};

/**
 * Main function to generate a campaign using AI
 */
export const generateCampaign = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // Generate creative insights
    const creativeInsights = await generateCreativeInsights(input, openAIConfig);
    console.log("Generated Creative Insights:", creativeInsights);
    
    // Find similar reference campaigns - now returns up to 5 diverse references
    const referenceCampaigns = await findSimilarCampaigns(input, openAIConfig);
    
    console.log("Matched Reference Campaigns:", 
      referenceCampaigns.map(c => ({
        name: c.name,
        brand: c.brand,
        industry: c.industry
      }))
    );

    // Select creative devices based on campaign style - increased to 3
    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    console.log("Selected Creative Devices:", creativeDevices.map(d => d.name));
    
    // Get relevant cultural trends
    const culturalTrends = getCachedCulturalTrends();

    // Give priority to non-tech trends for variety
    const prioritized = [
      ...culturalTrends.filter(t =>
        !t.platformTags.some(tag => tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar") || tag.toLowerCase().includes("vr") || tag.toLowerCase().includes("metaverse"))
      ),
      ...culturalTrends.filter(t =>
        t.platformTags.some(tag => tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar"))
      )
    ];
    
    // Shuffle and take 3 from the reordered list (increased from 2)
    const relevantTrends = prioritized
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    if (relevantTrends.length > 0) {
      console.log("Incorporating Cultural Trends:", relevantTrends.map(t => t.title));
    }
    
    // Create the campaign generation prompt
    const prompt = createCampaignPrompt(
      input, 
      referenceCampaigns, 
      creativeInsights, 
      creativeDevices,
      relevantTrends
    );
    
    console.log("Prompt Preview (first 200 chars):", prompt.substring(0, 200));
    
    // Generate the campaign with OpenAI
    const response = await generateWithOpenAI(prompt, openAIConfig);
    const cleanedResponse = extractJsonFromResponse(response);
    const generatedContent = JSON.parse(cleanedResponse);

    // Apply Creative Director refinement
    let improvedContent = generatedContent;
    try {
      improvedContent = await applyCreativeDirectorPass(generatedContent);
      console.log("✅ CD pass applied");
    } catch (err) {
      console.error("⚠️ CD pass failed:", err);
    }

    // Inject Disruptive Device via API
    let finalContent = improvedContent;
    try {
      const res = await fetch('/api/disruptive-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(improvedContent),
      });

      if (!res.ok) {
        throw new Error(`Disruptive pass API error: ${res.status}`);
      }
      
      const jsonResponse = await res.json();
      finalContent = jsonResponse;
      console.log("🎯 Disruptive twist added");
    } catch (err) {
      console.error("⚠️ Disruptive device injection failed:", err);
      // Use the previous content if the disruptive pass fails
      toast.error("Disruptive enhancement failed, using base campaign");
    }

    const campaign: GeneratedCampaign = {
      ...finalContent,
      referenceCampaigns,
      creativeInsights
    };
    
    // Generate storytelling narrative
    try {
      const storytellingInput = {
        brand: input.brand,
        industry: input.industry,
        targetAudience: input.targetAudience,
        emotionalAppeal: input.emotionalAppeal,
        campaignName: campaign.campaignName,
        keyMessage: campaign.keyMessage
      };
      
      const storytelling = await generateStorytellingNarrative(storytellingInput, openAIConfig);
      campaign.storytelling = storytelling;
    } catch (error) {
      console.error("Error generating storytelling content:", error);
      toast.error("Error generating storytelling content");
    }
    
    // Generate campaign evaluation
    try {
      const evaluation: CampaignEvaluation = await evaluateCampaign(campaign, openAIConfig);
      campaign.evaluation = evaluation;
    } catch (error) {
      console.error("Error evaluating campaign:", error);
    }
    
    return campaign;
  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};

// Re-export types for backwards compatibility
export type { CampaignInput, GeneratedCampaign, CampaignVersion };
