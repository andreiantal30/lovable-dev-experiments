import { toast } from "sonner";
import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignEvaluation, CampaignVersion, MultiLayeredInsight } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generateCreativeInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';
import { saveCampaignToLibrary } from './campaignStorage';
import { evaluateCampaign } from './campaign/evaluateCampaign';

const BACKEND_URL = 'https://animated-capybara-jj9qrx9r77pwc5qwj-8090.app.github.dev';

// 🧠 Brave Execution Scoring
const scoreExecution = (idea: string): number => {
  let score = 0;
  if (/delete|burn|sacrifice|confront|risk|forced/i.test(idea)) score += 3;
  if (/public|unexpected|hack|glitch|confession|live stream/i.test(idea)) score += 2;
  if (/bus stop|receipt|fridge|toilet|mirror|door|drone|ad blocker/i.test(idea)) score += 2;
  return score;
};

// 🎯 Cannes Spike Generator
const getCannesSpikeExecution = (brand: string): string | null => {
  const spikeExamples = {
    coffee: [
      "Host a coffee art competition in a public space where people create their own coffee art with fresh ingredients.",
      "Launch a ‘Coffee Taste Test’ street activation where strangers try blindfolded coffee challenges and share their reactions.",
      "Create a 'Coffee Lover’s Confession' challenge where people share their most embarrassing coffee moments for prizes."
    ],
    tech: [
      "Create a ‘Tech Throwback’ event where people bring their oldest tech items and compare them with the latest products.",
      "Run a ‘Tech Time Capsule’ challenge where users bury their tech predictions for the future and dig them up after five years.",
      "Set up a ‘Tech Fanatics’ museum showcasing iconic tech and their unique stories."
    ],
    fashion: [
      "Create a citywide thrift hunt where hidden garments hold QR-coded fashion stories.",
      "Hijack mannequins in fast fashion stores with protest couture made from upcycled clothes.",
      "Launch a public 'Style Swap Booth' where strangers exchange statement pieces anonymously."
    ]
  };

  const options = spikeExamples[brand.toLowerCase()];
  if (options?.length) {
    return options[Math.floor(Math.random() * options.length)];
  }
  return null;
};

// ✅ Brave Execution Enforcement
const ensureOneBraveExecution = (executions: string[], brand: string): string[] => {
  const fillerLines = [
    'Let users create and share their wildest product ideas',
    'Trigger a real-world dare campaign that spills into social media and real life'
  ];

  // Clean list: remove filler lines and duplicates
  const filtered = executions.filter(
    (e, idx, arr) =>
      !fillerLines.some(fb => e.toLowerCase().includes(fb.toLowerCase())) &&
      arr.findIndex(other => other.trim() === e.trim()) === idx
  );

  const safeWords = ['docuseries', 'AR experience', 'pop-up', 'co-creation', 'TikTok challenge'];
  const isSafe = filtered.every(e => safeWords.some(s => e.toLowerCase().includes(s)));

  if (filtered.length === 0 || isSafe) {
    const spike = getCannesSpikeExecution(brand);
    if (spike && !filtered.includes(spike)) {
      console.warn("💥 All executions were too safe — injecting Cannes Spike:", spike);
      return [...filtered, spike];
    }
  }

  return filtered;
};

// 🧠 CD Feedback
const applyCreativeDirectorPass = async (rawOutput: any) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cd-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawOutput),
    });
    if (!res.ok) throw new Error(`CD pass API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("CD pass failed:", err);
    return rawOutput;
  }
};

// 💥 Disruptive Device Injector
const injectDisruptivePass = async (input: any) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/disruptive-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign: input }),
    });

    if (!res.ok) {
      console.error(`Disruptive pass API error: ${res.status}`);
      toast.error(`Disruptive pass failed with status: ${res.status}`);
      return input;
    }

    const json = await res.json();
    return {
      ...input,
      keyMessage: json.keyMessage || input.keyMessage,
      prHeadline: json.prHeadline || input.prHeadline,
      viralHook: json.viralHook || input.viralHook,
      viralElement: json.viralElement || input.viralElement,
      callToAction: json.callToAction || input.callToAction,
      consumerInteraction: json.consumerInteraction || input.consumerInteraction,
    };
  } catch (err) {
    console.error("⚠️ Disruptive device injection failed:", err);
    toast.error("Disruptive enhancement failed.");
    return input;
  }
};

// 🔁 Main Generator
export const generateCampaign = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    const creativeInsights = await generateCreativeInsights(input, openAIConfig);
    const referenceCampaigns = await findSimilarCampaigns(input, openAIConfig);
    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    const culturalTrends = getCachedCulturalTrends();
    const relevantTrends = culturalTrends.sort(() => Math.random() - 0.5).slice(0, 3);

    const prompt = createCampaignPrompt(input, referenceCampaigns, creativeInsights, creativeDevices, relevantTrends);
    const raw = await generateWithOpenAI(prompt, openAIConfig);

    let parsed;
    try {
      parsed = JSON.parse(extractJsonFromResponse(raw));
    } catch (err) {
      console.error("❌ Failed to parse OpenAI response:", err);
      throw new Error("Failed to parse OpenAI response. Try simplifying the prompt.");
    }

    const improved = await applyCreativeDirectorPass(parsed);
    const withTwist = await injectDisruptivePass(improved);

    const executionScores = withTwist.executionPlan.map(scoreExecution);
    const spikeWorthy = executionScores.every(score => score < 5);
    if (spikeWorthy) {
      const spike = getCannesSpikeExecution(input.brand);
      if (spike && !withTwist.executionPlan.includes(spike)) {
        withTwist.executionPlan.push(spike);
      }
    }

    withTwist.executionPlan = ensureOneBraveExecution(withTwist.executionPlan, input.brand);

    if (!withTwist.campaignName || !withTwist.keyMessage || !withTwist.executionPlan) {
      throw new Error("Campaign is missing essential properties.");
    }

    const campaign: GeneratedCampaign = {
      ...withTwist,
      referenceCampaigns,
      creativeInsights,
      storytelling: "",
      evaluation: withTwist.evaluation,
    };

    const storytelling = await generateStorytellingNarrative({
      brand: input.brand,
      industry: input.industry,
      targetAudience: input.targetAudience,
      emotionalAppeal: input.emotionalAppeal,
      campaignName: campaign.campaignName,
      keyMessage: campaign.keyMessage,
    }, openAIConfig);
    campaign.storytelling = storytelling.narrative;

    const evaluation = await evaluateCampaign(campaign, { brand: input.brand, industry: input.industry }, openAIConfig);
    campaign.evaluation = evaluation;

    saveCampaignToLibrary({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      campaign,
      brand: input.brand,
      industry: input.industry,
      favorite: false,
    });

    return campaign;
  } catch (error) {
    toast.error(`Error generating campaign: ${error.message}`);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };