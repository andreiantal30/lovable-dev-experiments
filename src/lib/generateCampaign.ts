import { toast } from "sonner";
import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignVersion } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generatePenetratingInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse, cleanExecutionSteps } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';
import { saveCampaignToLibrary } from './campaignStorage';
import { evaluateCampaign } from './campaign/evaluateCampaign';
import { enhanceBravery } from './campaign/braveryEnhancer';
import { ReferenceCampaign } from './campaign/types';

const BACKEND_URL = 'https://animated-capybara-jj9qrx9r77pwc5qwj-8090.app.github.dev';

interface CreativeInsight {
  surfaceInsight: string;
  emotionalUndercurrent?: string;
  creativeUnlock?: string;
}

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

const selectTopBraveExecutions = (executions: string[], max = 5): string[] => {
  const scored = executions.map(ex => ({ ex, ...scoreBravery(ex) }));
  const sorted = scored.sort((a, b) => b.score - a.score);
  return sorted.slice(0, max).map(s => s.ex);
};

const getCannesSpikeExecution = (brand: string): string | null => {
  const spikeExamples = {
    coffee: [
      "Host a coffee art competition in a public space where people create their own coffee art with fresh ingredients.",
      "Launch a 'Coffee Taste Test' street activation where strangers try blindfolded coffee challenges and share their reactions.",
      "Create a 'Coffee Lover's Confession' challenge where people share their most embarrassing coffee moments for prizes."
    ],
    tech: [
      "Create a 'Tech Throwback' event where people bring their oldest tech items and compare them with the latest products.",
      "Run a 'Tech Time Capsule' challenge where users bury their tech predictions for the future and dig them up after five years.",
      "Set up a 'Tech Fanatics' museum showcasing iconic tech and their unique stories."
    ],
    fashion: [
      "Create a citywide thrift hunt where hidden garments hold QR-coded fashion stories.",
      "Hijack mannequins in fast fashion stores with protest couture made from upcycled clothes.",
      "Launch a public 'Style Swap Booth' where strangers exchange statement pieces anonymously."
    ]
  };

  const options = spikeExamples[brand.toLowerCase() as keyof typeof spikeExamples];
  if (options && options.length > 0) {
    return options[Math.floor(Math.random() * options.length)];
  }
  return null;
};

const filterWeakExecutions = (executions: string[]): string[] => {
  const bannedPatterns = [
    /tiktok challenge/i,
    /pop-up/i,
    /docuseries/i,
    /limited edition/i,
    /co[- ]?creation/i,
    /interactive website/i,
    /brand ambassador/i,
    /influencer/i,
    /web3/i,
    /AR experience/i,
    /immersive installation/i,
  ];

  return executions
    .filter(ex => !bannedPatterns.some(pattern => pattern.test(ex)))
    .filter((ex, idx, arr) => arr.findIndex(other => other.trim() === ex.trim()) === idx);
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
  const isSafe = filtered.some(e => safeWords.some(s => e.toLowerCase().includes(s))) || 
                filtered.length === 0;

  if (isSafe) {
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

const auditCampaignSafety = (campaign: any) => {
  const insight = campaign.creativeInsights?.[0]?.surfaceInsight || "";
  const executions = campaign.executionPlan || [];

  const isSafeInsight = !/(but|yet|however|although)/i.test(insight);
  const isSafeExecution = executions.every(ex =>
    !/(risk|interrupt|vulnerable|confess|graffiti|takeover|protest)/i.test(ex)
  );

  const weakestElement = isSafeInsight ? "safeInsight" : isSafeExecution ? "safeExecution" : null;
  return { weakestElement, content: isSafeInsight ? insight : executions.join('\n') };
};

const buildDisruptionPrompt = (weakest: string, templates: Record<string, string[]>, content: string) => {
  const templateOptions = templates[weakest] || [];
  return `
The campaign element below is too safe:
Type: ${weakest}
Content: "${content}"

${templateOptions.join('\n')}

Use these to create a braver version.

Return ONLY a valid JSON object in this format:
{
  "disruptedElement": "New, sharper version of the insight or execution line",
  "rationale": "Why this disruption breaks convention or provokes tension"
}`;
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

  if (!safetyAudit.weakestElement) return campaign;

  try {
    const prompt = buildDisruptionPrompt(safetyAudit.weakestElement, disruptionTemplates, safetyAudit.content);
    const raw = await generateWithOpenAI(prompt);
    const clean = extractJsonFromResponse(raw);
    const parsed = JSON.parse(clean);

    if (safetyAudit.weakestElement === 'safeInsight') {
      const existing = campaign.creativeInsights?.[0];
      if (typeof existing === 'object') {
        campaign.creativeInsights[0].surfaceInsight = parsed.disruptedElement;
      } else {
        campaign.creativeInsights[0] = {
          surfaceInsight: parsed.disruptedElement,
          emotionalUndercurrent: '',
          creativeUnlock: ''
        };
      }
    } else if (safetyAudit.weakestElement === 'safeExecution') {
      campaign.executionPlan.push(parsed.disruptedElement);
    }

    return campaign;
  } catch (error) {
    console.error("⚠️ Strategic disruption failed:", error);
    toast.error("Strategic disruption failed.");
    return campaign;
  }
};

export const generateCampaign = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    const creativeInsights = await generatePenetratingInsights(input, openAIConfig);
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
    const braveryEnhanced = await enhanceBravery(withTwist, input.brand, input.industry);

    let executions = braveryEnhanced.executionPlan || [];
    executions = filterWeakExecutions(executions);
    executions = ensureOneBraveExecution(executions, input.brand);
    executions = enhanceWithBravery(executions);
    executions = selectTopBraveExecutions(executions);
    executions = cleanExecutionSteps(executions);

    braveryEnhanced.executionPlan = executions;

    if (!withTwist.campaignName || !withTwist.keyMessage || !withTwist.executionPlan) {
      throw new Error("Campaign is missing essential properties.");
    }

    const campaign: GeneratedCampaign = {
      ...braveryEnhanced,
      referenceCampaigns: referenceCampaigns as any as ReferenceCampaign[],
      creativeInsights,
      storytelling: "",
      evaluation: braveryEnhanced.evaluation,
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

    // Get evaluation which now includes all bravery metrics
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
    toast.error(`Error generating campaign: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };