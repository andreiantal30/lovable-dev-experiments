import { toast } from "sonner";
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignVersion, ReferenceCampaign, CreativeInsight, MultilayeredInsight, ExtendedCampaignEvaluation } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generatePenetratingInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse, cleanExecutionSteps } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';
import { saveCampaignToLibrary } from './campaignStorage';
import { evaluateCampaign } from './campaign/evaluateCampaign';
import { enforceExecutionDiversity } from './campaign/executionFilters';

const BACKEND_URL = 'https://animated-capybara-jj9qrx9r77pwc5qwj-8090.app.github.dev';

interface BraveryMatrix {
  physicalIntervention: number;
  institutionalChallenge: number;
  personalRisk: number;
  culturalTension: number;
  novelty: number;
  targetsPower?: number;
  avoidsClichés?: number;
}

const EXECUTION_REPLACEMENTS = {
  "tiktok challenge": [
    "Guerrilla street challenge",
    "Institutional infiltration"
  ],
  "ar experience": [
    "Physical protest with AR elements",
    "Real-world treasure hunt with consequences"
  ],
  "pop-up": [
    "Permanent occupation",
    "Hostile architecture takeover"
  ]
};

// ================== EXECUTION HELPERS ================== //
const selectTopBraveExecutions = (executions: string[]): string[] => {
  const scored = executions.map(ex => ({
    ex,
    score: calculateBraveryMatrix({ executionPlan: [ex] } as GeneratedCampaign).culturalTension
  }));
  return scored.sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map(s => s.ex);
};

function getStrategicSpike(brand: string, creativeInsight: CreativeInsight): string {
  return `Strategic escalation for ${brand}: ${creativeInsight.keyMetric} ${creativeInsight.emotionalParadox?.split(' ').slice(0, 3).join(' ') || 'paradox'}`;
}

// ================== TYPE GUARDS ================== //
function isMultilayered(insight: CreativeInsight): insight is MultilayeredInsight {
  return !!insight.systemicRoot && !!insight.emotionalParadox && !!insight.culturalTension;
}

// ================== INSIGHT DEEPENING ================== //
const deepenInsights = async (
  insights: CreativeInsight[], 
  config: OpenAIConfig
): Promise<MultilayeredInsight[]> => {
  const prompt = `Transform these insights by adding:
  1. Systemic hypocrisy (institutional lies)
  2. Action paradox (catch-22 situations)
  3. Brand complicity (how brands benefit)
  4. Cultural tension (social dynamics)

  Insights: ${JSON.stringify(insights)}

  Return JSON array with:
  { 
    systemicHypocrisy: string, 
    actionParadox: string,
    brandComplicity: string,
    irony: string,
    culturalTension: string
  }[]`;

  try {
    const response = await generateWithOpenAI(prompt, config);
    const deepAnalysis = JSON.parse(extractJsonFromResponse(response)) as Array<{
      systemicHypocrisy: string;
      actionParadox: string;
      brandComplicity: string;
      irony: string;
      culturalTension: string;
    }>;

    return insights.map((insight, i) => ({
      ...insight,
      systemicRoot: deepAnalysis[i]?.systemicHypocrisy || 'System hypocrisy not identified',
      systemicHypocrisy: deepAnalysis[i]?.systemicHypocrisy || 'System hypocrisy not identified',
      actionParadox: deepAnalysis[i]?.actionParadox || 'No paradox identified',
      brandComplicity: deepAnalysis[i]?.brandComplicity || 'No brand complicity identified',
      irony: deepAnalysis[i]?.irony || 'No irony identified',
      culturalTension: deepAnalysis[i]?.culturalTension || 'Cultural tension not identified',
      emotionalParadox: insight.emotionalParadox || 'Emotional paradox not identified'
    }));
  } catch (error) {
    console.error("Insight deepening failed:", error);
    return insights.map(insight => ({
      ...insight,
      systemicRoot: 'System analysis failed',
      systemicHypocrisy: 'System hypocrisy analysis failed',
      actionParadox: 'Paradox analysis failed',
      brandComplicity: 'Brand complicity analysis failed',
      culturalTension: 'Cultural tension analysis failed',
      emotionalParadox: 'Emotional paradox analysis failed'
    }));
  }
};

// ================== ENHANCED BRAVERY SYSTEM ================== //
const calculateBraveryMatrix = (campaign: GeneratedCampaign): BraveryMatrix => {
  const text = JSON.stringify(campaign).toLowerCase();
  return {
    physicalIntervention: +(/(interrupt|hijack|vandal|occup|block)/i.test(text)) * 3,
    institutionalChallenge: +(/(government|police|university|hospital|council)/i.test(text)) * 2,
    personalRisk: +(/(confess|vulnerable|expose|embarrass)/i.test(text)) * 1.5,
    culturalTension: +(/(gender|race|class|privilege|inequality)/i.test(text)) * 3.5,
    novelty: 5 - +(/(tiktok|ar experience|pop-up|docuseries)/i.test(text)) * 2,
    targetsPower: +(/(CEO|board|executive|legislation)/i.test(text)) * 2,
    avoidsClichés: -+(/(hashtag|mural|petition)/i.test(text)) * 2
  };
};

// ================== DISRUPTION ENGINE ================== //
interface DisruptionAxis {
  name: string;
  test: RegExp;
  fix: string;
}

const disruptOnAllAxes = async (
  campaign: GeneratedCampaign,
  config: OpenAIConfig
): Promise<GeneratedCampaign> => {
  const disruptionAxes: DisruptionAxis[] = [
    {
      name: "Medium",
      test: /digital|app|online|virtual|metaverse/i,
      fix: "Convert to physical protest with real-world consequences"
    },
    {
      name: "Tone",
      test: /fun|playful|game|lighthearted|entertaining/i,
      fix: "Make it confrontational and uncomfortable for power structures"
    },
    {
      name: "Agency",
      test: /user|participant|player|viewer|spectator|community/i,
      fix: "Force institutional response through collective action"
    },
    {
      name: "Risk",
      test: /safe|harmless|brand-friendly|approved/i,
      fix: "Introduce real personal or institutional risk"
    }
  ];

  let modifiedCampaign = { ...campaign };
  let wasDisrupted = false;

  for (const axis of disruptionAxes) {
    if (axis.test.test(JSON.stringify(modifiedCampaign).toLowerCase())) {
      try {
        const prompt = `Take this ${axis.name} axis from safe to brave:
Current Campaign: ${JSON.stringify({
          strategy: modifiedCampaign.creativeStrategy,
          executions: modifiedCampaign.executionPlan
        }, null, 2)}

Axis Being Disrupted: ${axis.name}
Disruption Requirement: ${axis.fix}

Return ONLY the modified campaign JSON in this exact format:
{
  "creativeStrategy": string[],
  "executionPlan": string[]
}`;

        const response = await generateWithOpenAI(prompt, config);
        const disruptionResult = JSON.parse(extractJsonFromResponse(response));

        modifiedCampaign = {
          ...modifiedCampaign,
          creativeStrategy: disruptionResult.creativeStrategy || modifiedCampaign.creativeStrategy,
          executionPlan: disruptionResult.executionPlan || modifiedCampaign.executionPlan,
          _cdModifications: [
            ...(modifiedCampaign._cdModifications || []),
            `${axis.name} axis disrupted: ${axis.fix}`
          ]
        };

        wasDisrupted = true;
      } catch (error) {
        console.error(`Disruption on ${axis.name} axis failed:`, error);
      }
    }
  }

  // Fallback polish if no disruption occurred
  if (!wasDisrupted) {
    try {
      const polishPrompt = `Polish the tone, metaphor, and storytelling of this campaign to make it emotionally richer and more Cannes-worthy. Do not change the core idea, just rewrite the language to elevate it.

Campaign: ${JSON.stringify(modifiedCampaign, null, 2)}

Return JSON:`;
      const polishResponse = await generateWithOpenAI(polishPrompt, config);
      const polished = JSON.parse(extractJsonFromResponse(polishResponse));

      modifiedCampaign = {
        ...modifiedCampaign,
        ...polished,
        _cdModifications: [
          ...(modifiedCampaign._cdModifications || []),
          "Fallback storytelling polish applied"
        ]
      };
    } catch (e) {
      console.error("Fallback storytelling polish failed:", e);
    }
  }

  return modifiedCampaign;
};


// ================== EXECUTION POLISH ================== //
const upgradeWeakExecutions = (executions: string[]): string[] => {
  return executions.map(ex => {
    for (const [pattern, replacements] of Object.entries(EXECUTION_REPLACEMENTS)) {
      if (new RegExp(pattern, 'i').test(ex)) {
        return replacements[Math.floor(Math.random() * replacements.length)];
      }
    }
    return ex;
  });
};

// ================== CORE GENERATOR ================== //
export const generateCampaign = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // 1. Generate foundational elements with enhanced insights
    const rawInsights = (await generatePenetratingInsights(input, openAIConfig)).slice(0, 1);
    const creativeInsights = (await deepenInsights(rawInsights, openAIConfig))
      .map(insight => ({
        ...insight,
        culturalTension: insight.culturalTension || 'Cultural tension not identified',
        emotionalParadox: insight.emotionalParadox || 'Emotional paradox not identified'
      }));

    const referenceCampaigns = (await findSimilarCampaigns(input, openAIConfig))
      .filter(ref => ref.year);
    
    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    const relevantTrends = getCachedCulturalTrends()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 2. Create initial campaign
    const prompt = createCampaignPrompt(
      input, 
      referenceCampaigns, 
      creativeInsights, 
      creativeDevices, 
      relevantTrends
    );
    
    let parsed: GeneratedCampaign = JSON.parse(
      extractJsonFromResponse(await generateWithOpenAI(prompt, openAIConfig))
    );

    const originalSoul = {
      campaignName: parsed.campaignName,
      keyMessage: parsed.keyMessage,
      executionPlan: parsed.executionPlan,
      creativeInsights: parsed.creativeInsights
    };

    function logDifferences(pre: GeneratedCampaign, post: GeneratedCampaign) {
      const changedFields = Object.keys(pre).filter(key => {
        return JSON.stringify(pre[key as keyof GeneratedCampaign]) !== JSON.stringify(post[key as keyof GeneratedCampaign]);
      });
    
      console.log("🧠 Fields changed during CD Pass:", changedFields);
    }

    // 3. Creative Director pass
console.group('🎭 Creative Director Pass');
const improved = await disruptOnAllAxes(parsed, openAIConfig);

// ✅ Emotion Balance Pass – ensure emotional warmth isn't lost
if (!/hope|connection|joy|pride|resilience|community/i.test(improved.storytelling)) {
  try {
    const rebalancePrompt = `This campaign lost emotional connection. Polish the language to restore hope, emotional resonance, or a sense of human connection—without undoing the bravery or confrontation.

Campaign: ${JSON.stringify(improved, null, 2)}

Return JSON:`;
    const balanceResponse = await generateWithOpenAI(rebalancePrompt, openAIConfig);
    const emotionallyBalanced = JSON.parse(extractJsonFromResponse(balanceResponse));

    improved.storytelling = emotionallyBalanced.storytelling || improved.storytelling;
    improved.creativeStrategy = emotionallyBalanced.creativeStrategy || improved.creativeStrategy;
    improved.executionPlan = emotionallyBalanced.executionPlan || improved.executionPlan;

    improved._cdModifications = [
      ...(improved._cdModifications || []),
      "Emotion rebalance pass applied"
    ];
  } catch (e) {
    console.warn("⚠️ Emotion rebalance failed:", e);
  }
}

// ✅ NEW: Apply narrative polish to restore emotional resonance
const polished = await generateStorytellingNarrative({
  brand: input.brand,
  industry: input.industry,
  targetAudience: input.targetAudience,
  emotionalAppeal: input.emotionalAppeal,
  campaignName: improved.campaignName,
  keyMessage: improved.keyMessage,
}, openAIConfig);

improved.storytelling = polished.narrative;

// ✅ Emotion Balance Pass – ensure emotional warmth isn't lost
if (!/hope|connection|joy|pride|resilience|community/i.test(improved.storytelling)) {
  try {
    const rebalancePrompt = `This campaign lost emotional connection. Polish the language to restore hope, emotional resonance, or a sense of human connection—without undoing the bravery or confrontation.

Campaign: ${JSON.stringify(improved, null, 2)}

Return JSON:`;
    const balanceResponse = await generateWithOpenAI(rebalancePrompt, openAIConfig);
    const emotionallyBalanced = JSON.parse(extractJsonFromResponse(balanceResponse));

    improved.storytelling = emotionallyBalanced.storytelling || improved.storytelling;
    improved.creativeStrategy = emotionallyBalanced.creativeStrategy || improved.creativeStrategy;
    improved.executionPlan = emotionallyBalanced.executionPlan || improved.executionPlan;

    improved._cdModifications = [
      ...(improved._cdModifications || []),
      "Emotion rebalance pass applied"
    ];
  } catch (e) {
    console.warn("⚠️ Emotion rebalance failed:", e);
  }
}

console.log('🟠 Pre-CD:', JSON.stringify(parsed, null, 2));
console.log('🔵 Post-CD:', JSON.stringify(improved, null, 2));
logDifferences(parsed, improved);
console.groupEnd();


// 4. Execution plan refinement
let executions = improved.executionPlan || [];

let upgradedExecutions = [
  ...upgradeWeakExecutions(executions),
  getStrategicSpike(input.brand, creativeInsights[0])
];

// ✨ Apply bravery ranking + execution diversity
let topExecutions = enforceExecutionDiversity(
  selectTopBraveExecutions(upgradedExecutions)
);

// If none of the executions score high enough, inject a Cannes-worthy spike
const needsSpike = topExecutions.every(ex => {
  const bravery = calculateBraveryMatrix({ executionPlan: [ex] } as GeneratedCampaign);
  const score =
    bravery.physicalIntervention +
    bravery.institutionalChallenge +
    bravery.personalRisk +
    bravery.culturalTension;
  return score < 7;
});

if (needsSpike) {
  const spike = `Cannes Spike: Partner with controversial artists or social critics to create a one-day-only protest art installation inside the brand’s flagship store—unannounced, uncensored, and impossible to ignore.`;
  topExecutions.unshift(spike);
}

executions = cleanExecutionSteps(topExecutions);
    
    executions = cleanExecutionSteps(topExecutions);

    // 5. Final assembly with proper typing
    const campaign: GeneratedCampaign = {
      ...improved,
      executionPlan: executions,
      referenceCampaigns,
      creativeInsights: creativeInsights as MultilayeredInsight[],
      storytelling: "",
    };

    // 6. Generate narrative and evaluation
    campaign.storytelling = (await generateStorytellingNarrative({
      brand: input.brand,
      industry: input.industry,
      targetAudience: input.targetAudience,
      emotionalAppeal: input.emotionalAppeal,
      campaignName: campaign.campaignName,
      keyMessage: campaign.keyMessage,
    }, openAIConfig)).narrative;

    const evaluation = await evaluateCampaign(
      campaign, 
      { brand: input.brand, industry: input.industry }, 
      openAIConfig,
      originalSoul
    ) as ExtendedCampaignEvaluation;

    campaign.evaluation = {
      ...evaluation,
      braveryMatrix: calculateBraveryMatrix(campaign)
    };

    // 7. Save and return
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
    console.error("❌ Campaign generation failed:", error);
    toast.error(`Generation failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export type { CampaignInput, GeneratedCampaign, CampaignVersion };