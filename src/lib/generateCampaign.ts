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

// ... imports remain unchanged

// 🔥 Enhanced bravery scoring
const scoreBravery = (idea: string): { score: number; reasons: string[] } => {
  const reasons = [];
  let score = 0;

  if (/(interrupt|hijack|vandal|graffiti|takeover|occup|block|barricade)/i.test(idea)) {
    score += 3;
    reasons.push("Physical world intervention");
  }

  if (/(government|police|school|university|hospital|city council)/i.test(idea)) {
    score += 3;
    reasons.push("Challenges authority");
  }

  if (/(embarrass|confess|vulnerable|expose|naked truth)/i.test(idea)) {
    score += 2;
    reasons.push("Personal vulnerability");
  }

  if (/(gender|race|class|privilege|inequality|climate denial)/i.test(idea)) {
    score += 4;
    reasons.push("Touches cultural tension");
  }

  return { score, reasons };
};

const applyBraveryTemplate = (idea: string, reasons: string[]): string => {
  return `${idea} (🔥 Elevated for bravery: ${reasons.join(', ')})`;
};

const enhanceWithBravery = (executions: string[]): string[] => {
  return executions.map(e => {
    const { score, reasons } = scoreBravery(e);
    if (score < 5 && reasons.length) {
      return applyBraveryTemplate(e, reasons);
    }
    return e;
  });
};

const getCannesSpikeExecution = (brand: string): string | null => {
  const spikeExamples = {
    coffee: [/* ... */],
    tech: [/* ... */],
    fashion: [/* ... */]
  };

  const options = spikeExamples[brand.toLowerCase()];
  if (options && options.length > 0) {
    return options[Math.floor(Math.random() * options.length)];
  }
  return null;
};

const ensureOneBraveExecution = (executions: string[], brand: string): string[] => {
  const fallbackLines = [
    'Let users create and share their wildest product ideas',
    'Trigger a real-world dare campaign that spills into social media and real life'
  ];

  const filtered = executions.filter(
    (e, idx, arr) =>
      !fallbackLines.some(fb => e.toLowerCase().includes(fb.toLowerCase())) &&
      arr.findIndex(other => other.trim() === e.trim()) === idx
  );

  const safeWords = ['docuseries', 'AR experience', 'pop-up', 'co-creation', 'TikTok challenge'];
  const isSafe = filtered.some(e => safeWords.some(s => e.toLowerCase().includes(s)));

  if (filtered.length === 0 || isSafe) {
    const spike = getCannesSpikeExecution(brand);
    if (spike && !filtered.includes(spike)) {
      console.warn("🛑 Execution too safe or generic. Injecting a Cannes Spike:", spike);
      return [...filtered, spike];
    }
  }

  return filtered;
};

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

// 🧠 Strategic Disruption Logic
const auditCampaignSafety = (campaign: any) => {
  const insight = campaign.creativeInsights?.[0]?.surfaceInsight || "";
  const executions = campaign.executionPlan || [];

  const isSafeInsight = !/(but|yet|however|although)/i.test(insight);
  const isSafeExecution = executions.every(ex =>
    !/(risk|interrupt|vulnerable|confess|graffiti|takeover|protest)/i.test(ex)
  );

  const weakestElement = isSafeInsight ? "safeInsight" : isSafeExecution ? "safeExecution" : null;
  return { weakestElement };
};

const buildDisruptionPrompt = (weakest: string, templates: Record<string, string[]>) => {
  const templateOptions = templates[weakest] || [];
  const selected = templateOptions[Math.floor(Math.random() * templateOptions.length)];
  return `You’re a creative disruptor. ${selected}\nReturn a revised version of the campaign with bold, strategic tweaks. Respond in JSON.`;
};

const injectStrategicDisruption = async (campaign: any) => {
  const safetyAudit = auditCampaignSafety(campaign);

  const disruptionTemplates = {
    safeInsight: [
      "What if we said the OPPOSITE of this insight?",
      "How can we make this insight physically manifest?",
      "What institution does this insight threaten?"
    ],
    safeExecution: [
      "Instead of digital, how would this work as physical protest?",
      "What if we forced participation rather than invited it?",
      "How could this idea break a social norm?"
    ]
  };

  const disruptionPrompt = buildDisruptionPrompt(safetyAudit.weakestElement, disruptionTemplates);

  try {
    const raw = await generateWithOpenAI(disruptionPrompt);
    return JSON.parse(extractJsonFromResponse(raw));
  } catch (error) {
    console.error("⚠️ Strategic disruption failed:", error);
    return campaign;
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
    const relevantTrends = culturalTrends.sort(() => Math.random() - 0.5).slice(0, 3);

    const prompt = createCampaignPrompt(input, referenceCampaigns, creativeInsights, creativeDevices, relevantTrends);
    const raw = await generateWithOpenAI(prompt, openAIConfig);

    let parsed;
    try {
      parsed = JSON.parse(extractJsonFromResponse(raw));
    } catch (err) {
      console.error("❌ Failed to parse OpenAI response:", err);
      throw new Error("Failed to parse OpenAI response.");
    }

    const improved = await applyCreativeDirectorPass(parsed);
    const withTwist = await injectStrategicDisruption(improved);

    withTwist.executionPlan = ensureOneBraveExecution(withTwist.executionPlan, input.brand);
    withTwist.executionPlan = enhanceWithBravery(withTwist.executionPlan);

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
    console.error("❌ Error generating campaign:", error);
    toast.error(`Error generating campaign: ${error.message}`);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };