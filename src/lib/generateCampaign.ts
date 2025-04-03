// generateCampaign.ts
import { toast } from "sonner";
import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignEvaluation, CampaignVersion } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generateCreativeInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';
import { saveCampaignToLibrary } from './campaignStorage';
import { evaluateCampaign } from './campaign/evaluateCampaign';

// 🔥 Bravery Enhancer
const ensureOneBraveExecution = (executions: string[]): string[] => {
  const safeWords = ['docuseries', 'AR experience', 'pop-up', 'co-creation', 'TikTok challenge'];
  const safe = executions.some(e =>
    safeWords.some(s => e.toLowerCase().includes(s))
  );
  if (safe) {
    console.warn("🛑 Execution too safe. Injecting braver fallback.");
    return [...executions, "Create an experience that forces people to confront a personal truth in a public way."];
  }
  return executions;
};

// 🧠 Cannes Execution Scorer
const scoreExecution = (idea: string): number => {
  let score = 0;
  if (/delete|burn|sacrifice|confront|risk|forced/i.test(idea)) score += 3; // Behavioral provocation
  if (/public|unexpected|hack|glitch|confession|live stream/i.test(idea)) score += 2; // Shock factor
  if (/bus stop|receipt|fridge|toilet|mirror|door|drone|ad blocker/i.test(idea)) score += 2; // Format subversion
  return score;
};

const getCannesSpikeExecution = (): string => {
  const spikeExamples = [
    "Turn receipts into breakup letters printed at checkout, based on abandoned carts.",
    "Let users burn a digital wishlist to unlock a limited drop.",
    "Set up a one-day ‘Regret Museum’ inside IKEA — showcasing returned items and their breakup stories.",
    "Launch a hotline where users confess their worst adulting fail — and get a room makeover inspired by it.",
  ];
  return spikeExamples[Math.floor(Math.random() * spikeExamples.length)];
};

const applyCreativeDirectorPass = async (rawOutput: any) => {
  try {
    const res = await fetch('/api/cd-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawOutput),
    });
    if (!res.ok) {
      console.error(`CD pass API error: ${res.status}`);
      return rawOutput;
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
    const referenceCampaigns = await findSimilarCampaigns(input, openAIConfig);
    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    const culturalTrends = getCachedCulturalTrends();

    const prioritized = [
      ...culturalTrends.filter(t =>
        !t.platformTags.some(tag =>
          tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar") || tag.toLowerCase().includes("vr") || tag.toLowerCase().includes("metaverse"))
      ),
      ...culturalTrends.filter(t =>
        t.platformTags.some(tag =>
          tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("ar"))
      )
    ];
    const relevantTrends = prioritized.sort(() => Math.random() - 0.5).slice(0, 3);

    const prompt = createCampaignPrompt(
      input, referenceCampaigns, creativeInsights, creativeDevices, relevantTrends
    );

    const response = await generateWithOpenAI(prompt, openAIConfig);
    const cleanedResponse = extractJsonFromResponse(response);
    const generatedContent = JSON.parse(cleanedResponse);

    // 🧠 CD Feedback Layer
    let improvedContent = await applyCreativeDirectorPass(generatedContent);

    // 💥 Disruptive Twist Layer
    let finalContent = improvedContent;
    try {
      const res = await fetch('/api/disruptive-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: improvedContent }),
      });

      if (!res.ok) throw new Error(`Disruptive pass API error: ${res.status}`);
      const jsonResponse = await res.json();

      finalContent = {
        ...improvedContent,
        keyMessage: jsonResponse.keyMessage || improvedContent.keyMessage,
        prHeadline: jsonResponse.prHeadline || improvedContent.prHeadline,
        viralHook: jsonResponse.viralHook || improvedContent.viralHook,
        viralElement: jsonResponse.viralElement || improvedContent.viralElement,
        callToAction: jsonResponse.callToAction || improvedContent.callToAction,
        consumerInteraction: jsonResponse.consumerInteraction || improvedContent.consumerInteraction,
      };

      console.log("🎯 Disruptive twist added");
    } catch (err) {
      console.error("⚠️ Disruptive device injection failed:", err);
      toast.error("Disruptive enhancement failed, using base campaign");
    }

    // ✅ Bravery + Cannes Spike Scoring
    const executionScores = finalContent.executionPlan.map(scoreExecution);
    const avgScore = executionScores.reduce((a, b) => a + b, 0) / executionScores.length;

    if (avgScore < 4) {
      const spike = getCannesSpikeExecution();
      finalContent.executionPlan.push(spike);
      console.warn("💥 Execution ideas were too flat. Injected Cannes Spike:", spike);
    }

    finalContent.executionPlan = ensureOneBraveExecution(finalContent.executionPlan);

    // 🧱 Compose full campaign object
    const campaign: GeneratedCampaign = {
      ...finalContent,
      referenceCampaigns,
      creativeInsights,
      storytelling: "",
      evaluation: finalContent.evaluation
    };

    // 🪄 Storytelling
    try {
      const storytelling = await generateStorytellingNarrative({
        brand: input.brand,
        industry: input.industry,
        targetAudience: input.targetAudience,
        emotionalAppeal: input.emotionalAppeal,
        campaignName: campaign.campaignName,
        keyMessage: campaign.keyMessage
      }, openAIConfig);
      campaign.storytelling = storytelling.narrative;
    } catch (error) {
      console.error("Error generating storytelling content:", error);
      toast.error("Error generating storytelling content");
    }

    // 🧠 Evaluation (pass brand/industry as context)
    try {
      const evaluation: CampaignEvaluation = await evaluateCampaign(
        campaign,
        { brand: input.brand, industry: input.industry },
        openAIConfig
      );
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

    // 💾 Save to Library
    try {
      const saved = saveCampaignToLibrary({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        campaign: {
          ...campaign,
          evaluation: campaign.evaluation,
          prHeadline: campaign.prHeadline || "",
        },
        brand: input.brand,
        industry: input.industry,
        favorite: false,
      });

      if (saved) {
        console.log("✅ Campaign saved to Library");
      } else {
        console.warn("⚠️ Campaign not saved — possible duplicate?");
      }
    } catch (error) {
      console.error("❌ Failed to save campaign:", error);
    }

    console.log("🚀 Final campaign object being returned:", campaign);
    return campaign;

  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };