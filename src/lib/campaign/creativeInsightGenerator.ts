import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
  systemicHypocrisy: string;
  actionParadox: string;
  irony?: string;
  brandComplicity?: string;
  insightScore?: number;
  layer?: string; // NEW: Tracks insight origin
}

// 🔍 Enhanced scoring with layer weighting
const scoreInsight = (insight: MultiLayeredInsight): number => {
  let score = 0;
  const WEIGHTS = {
    contradiction: 3,
    emotionalDepth: 2,
    systemicLie: 4,
    layerBonus: insight.layer ? 2 : 0 // NEW: Reward data-backed insights
  };

  // Tier 1: Core tension
  if (/but|however|yet|although|paradox/i.test(insight.surfaceInsight)) {
    score += WEIGHTS.contradiction;
  }

  // Tier 2: Emotional depth
  const emotionalMarkers = {
    guilt: 2, shame: 2, fear: 1, longing: 1, resentment: 3
  };
  Object.entries(emotionalMarkers).forEach(([term, points]) => {
    if (new RegExp(term, 'i').test(insight.emotionalUndercurrent)) {
      score += points * WEIGHTS.emotionalDepth;
    }
  });

  // Tier 3: Systemic analysis
  if (insight.systemicHypocrisy) score += WEIGHTS.systemicLie;
  if (insight.layer) score += WEIGHTS.layerBonus; // NEW

  return Math.min(score, 15); // Increased max score
};

// NEW: Atomic insight generator (fact-based)
export async function generateAtomicInsights(
  input: CampaignInput,
  config: OpenAIConfig
): Promise<MultiLayeredInsight[]> {
  const analysisLayers = [
    {
      name: "public_vs_private",
      prompt: `Compare ${input.brand}'s: 
      - Public claims from their latest sustainability report
      - Actual data from their supply chain disclosures`
    },
    {
      name: "industry_contradictions",
      prompt: `Analyze ${input.industry}'s:
      - Stated values vs standard business practices
      - Trade association lobbying positions`
    }
  ];

  try {
    const layerInsights = await Promise.all(
      analysisLayers.map(async layer => {
        const response = await generateWithOpenAI(
          `Identify SPECIFIC contradictions in:\n${layer.prompt}\n` +
          `Format as JSON: { 
            "surfaceInsight": "They publicly X, but data shows Y",
            "systemicHypocrisy": "Industry claims A while doing B" 
          }`,
          config
        );
        return {
          ...JSON.parse(extractJsonFromResponse(response)),
          layer: layer.name,
          insightScore: 5 // Base score for atomic insights
        };
      })
    );
    return layerInsights;
  } catch (error) {
    console.error("Atomic insight generation failed:", error);
    return [{
      ...getFallbackInsight(input),
      layer: "fallback",
      insightScore: 3
    }];
  }
}

// UPDATED: Main generator with atomic integration
export async function generateCreativeInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4' }
): Promise<MultiLayeredInsight[]> {
  try {
    // 1. Get factual contradictions first
    const atomicInsights = await generateAtomicInsights(input, config);
    
    // 2. Build creative narratives from facts
    const creativePrompt = `Transform these factual contradictions into creative briefs:
${atomicInsights.map(i => `- ${i.surfaceInsight}`).join('\n')}

For each, generate:
1. Emotional hook (use visceral language)
2. Deeper systemic lie
3. Actionable creative unlock
4. Ironic twist

Return JSON array with this structure:
[{
  "surfaceInsight": "...",
  "emotionalUndercurrent": "...",
  "systemicHypocrisy": "...",
  "irony": "...",
  "creativeUnlock": "..."
}]`;

    const response = await generateWithOpenAI(creativePrompt, config);
    const creativeInsights = JSON.parse(extractJsonFromResponse(response));

    // 3. Merge atomic data with creative narratives
    return creativeInsights.map((insight: MultiLayeredInsight, i: number) => ({
      ...atomicInsights[i],
      ...insight,
      insightScore: scoreInsight({ ...atomicInsights[i], ...insight })
    }));

  } catch (error) {
    console.error("Creative insight generation failed:", error);
    return [getFallbackInsight(input)];
  }
}

// UPDATED: Penetrating insights with atomic base
export async function generatePenetratingInsights(
  input: CampaignInput,
  config: OpenAIConfig
): Promise<MultiLayeredInsight[]> {
  try {
    const baseInsights = await generateCreativeInsights(input, config);
    const deepest = baseInsights.sort((a, b) => b.insightScore! - a.insightScore!)[0];

    const deepeningPrompt = `Take this insight deeper:
${deepest.surfaceInsight}

Generate 3 variations that:
1. Make the systemic hypocrisy more damning
2. Increase emotional intensity
3. Sharpen the creative unlock

Return JSON array with this structure:
[{
  "surfaceInsight": "...",
  "emotionalUndercurrent": "...",
  ...
}]`;

    const response = await generateWithOpenAI(deepeningPrompt, config);
    const deepened = JSON.parse(extractJsonFromResponse(response));

    return [deepest, ...deepened]
      .map(insight => ({ ...insight, insightScore: scoreInsight(insight) }))
      .slice(0, 3);

  } catch (error) {
    console.error("Insight deepening failed:", error);
    return [getFallbackInsight(input)];
  }
}

function getFallbackInsight(input: CampaignInput): MultiLayeredInsight {
  return {
    surfaceInsight: `${input.brand} claims sustainability but depends on fast fashion`,
    emotionalUndercurrent: "Frustration at being forced to participate in broken systems",
    systemicHypocrisy: "The industry rewards performative activism over real change",
    irony: "The more 'sustainable' brands appear, the worse environmental metrics get",
    brandComplicity: `${input.brand} uses sustainability as a growth strategy`,
    actionParadox: "Must temporarily increase waste to expose waste systems",
    creativeUnlock: "Help them weaponize their own contradictions against the system",
    insightScore: 8
  };
}