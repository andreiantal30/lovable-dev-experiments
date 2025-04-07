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
import { reinforceExecutionDiversity } from './campaign/executionFilters'; // Removed duplicate import
import { boostCreativeStrategy } from './campaign/strategyBooster';
import { injectNarrativeAnchor } from './campaign/narrativeAnchor';

const BACKEND_URL = 'https://animated-capybara-jj9qrx9r77pwc5qwj-8090.app.github.dev';

interface BraveryMatrix {
  physicalIntervention: number;
  institutionalChallenge: number;
  personalRisk: number;
  culturalTension: number;
  novelty: number;
  targetsPower?: number;
  avoidsClichés?: number;
  environmentalBravery?: number;
  matrix?: number[][]; // Added the 'matrix' property
}

const EXECUTION_REPLACEMENTS = {
  "tiktok challenge": [
    "Guerrilla street challenge with real consequences",
    "Institutional infiltration operation"
  ],
  "ar experience": [
    "Physical protest with AR evidence collection",
    "Real-world treasure hunt exposing corporate lies"
  ],
  "pop-up": [
    "Permanent occupation installation",
    "Hostile architecture takeover"
  ]
};

const SUSTAINABILITY_EXECUTION_REPLACEMENTS = {
  "pledge": [
    "Corporate accountability tribunal",
    "Sustainability compliance checkpoint"
  ],
  "petition": [
    "Direct action intervention",
    "Shareholder resolution proposal"
  ]
};

const SUSTAINABILITY_BRAVERY_TRIGGERS = [
  "fossil fuel", "oil company", "plastic", "deforestation",
  "greenwash", "pledge gap", "promise gap"
];

// ================== VALIDATION HELPERS ================== //
const validateExecution = (execution: string): boolean => {
  const bannedPatterns = [
    /surprise \w+ execution/i,
    /bold new expression/i,
    /subvert expectations/i,
    /using \w+ mechanics/i
  ];
  return !bannedPatterns.some(p => p.test(execution));
};

// ================== EXECUTION HELPERS ================== //
const selectTopBraveExecutions = (executions: string[]): string[] => {
  // First filter and deduplicate
  const validUniqueExecutions = [...new Set(executions.filter(validateExecution))];
  
  const scored = validUniqueExecutions.map(ex => {
    const bravery = calculateBraveryMatrix({ executionPlan: [ex] } as GeneratedCampaign);
    return {
      ex,
      score: bravery.culturalTension + (bravery.environmentalBravery || 0) * 1.5
    };
  });
  
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
  const isSustainability = /green|eco|sustainab|environment/i.test(text);
  
  return {
    physicalIntervention: +(/(interrupt|hijack|vandal|occup|block|reclaim|install)/i.test(text)) * 3,
    institutionalChallenge: +(/(government|police|university|corporat|executive|legislat|headquarters)/i.test(text)) * 2.5,
    personalRisk: +(/(confess|vulnerable|expose|embarrass|arrest)/i.test(text)) * 1.5,
    culturalTension: isSustainability ? 
      +(/(greenwash|climate|eco|pollut)/i.test(text)) * 4 : 
      +(/(gender|race|class|privilege)/i.test(text)) * 3.5,
    novelty: 5 - +(/(tiktok|ar experience|pop-up|docuseries|petition|hashtag)/i.test(text)) * 2, // Set novelty
    targetsPower: +(/(CEO|board|executive|legislation|oil|fossil)/i.test(text)) * 2.5,
    avoidsClichés: -+(/(hashtag|mural|pledge|signature)/i.test(text)) * 2,
    environmentalBravery: isSustainability ? 
      +(new RegExp(SUSTAINABILITY_BRAVERY_TRIGGERS.join('|'), 'i').test(text)) * 3 : 0,
    matrix: [
      [1, 2, 3], // Example values for the matrix
      [4, 5, 6],
      [7, 8, 9]
    ]
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
    },
    {
      name: "SustainabilityImpact",
      test: /green|eco|sustainab|environment/i,
      fix: "Make the environmental impact tangible and measurable with clear corporate accountability"
    },
    {
      name: "CorporateAccountability",
      test: /consumer|individual|personal action/i,
      fix: "Shift focus from individual action to systemic corporate responsibility"
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
      const polishPrompt = `Polish this campaign to:
1. Tighten corporate accountability angles
2. Make environmental impact measurable
3. Strengthen protest narratives
4. Maintain rebellious tone with specificity

Campaign: ${JSON.stringify(modifiedCampaign, null, 2)}

Return JSON:`;
      const polishResponse = await generateWithOpenAI(polishPrompt, config);
      const polished = JSON.parse(extractJsonFromResponse(polishResponse));

      modifiedCampaign = {
        ...modifiedCampaign,
        ...polished,
        _cdModifications: [
          ...(modifiedCampaign._cdModifications || []),
          "Enhanced storytelling polish applied"
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
    // Check standard replacements
    for (const [pattern, replacements] of Object.entries(EXECUTION_REPLACEMENTS)) {
      if (new RegExp(pattern, 'i').test(ex)) {
        return replacements[Math.floor(Math.random() * replacements.length)];
      }
    }
    
    // Check sustainability-specific replacements
    if (/green|eco|sustainab|environment/i.test(ex)) {
      for (const [pattern, replacements] of Object.entries(SUSTAINABILITY_EXECUTION_REPLACEMENTS)) {
        if (new RegExp(pattern, 'i').test(ex)) {
          return replacements[Math.floor(Math.random() * replacements.length)];
        }
      }
    }
    
    return ex;
  });
};

// ================== EXECUTION DIVERSITY ================== //
const enforceExecutionDiversity = (executions: string[]): string[] => {
  const categorized = executions.map(ex => ({
    ex,
    category: ex.includes('install') ? 'art' :
              ex.includes('march') ? 'public' :
              ex.includes('corporate') ? 'institutional' :
              ex.includes('LEGO') ? 'symbolic' : 'other'
  }));

  const grouped = categorized.reduce((acc, {ex, category}) => {
    acc[category] = [...(acc[category] || []), ex];
    return acc;
  }, {} as Record<string, string[]>);

  return Object.values(grouped)
    .flatMap(group => group.slice(0, 2)) // Max 2 per category
    .filter(validateExecution)
    .slice(0, 7);
};

// ================== CORE GENERATOR ================== //
export const generateCampaign = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // 1. Generate foundational elements
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

    improved.creativeStrategy = await boostCreativeStrategy(
      improved.creativeStrategy,
      creativeInsights[0],
      openAIConfig
    );

    const polished = await generateStorytellingNarrative({
      brand: input.brand,
      industry: input.industry,
      targetAudience: input.targetAudience,
      emotionalAppeal: input.emotionalAppeal,
      campaignName: improved.campaignName,
      keyMessage: improved.keyMessage,
    }, openAIConfig);

    improved.storytelling = polished.narrative;

    try {
      const reinforced = await injectNarrativeAnchor(improved, openAIConfig);
      improved.storytelling = reinforced || improved.storytelling;
      improved._cdModifications = [
        ...(improved._cdModifications || []),
        "Narrative anchor pass applied"
      ];
    } catch (e) {
      console.warn("⚠️ Narrative anchor pass failed:", e);
    }

    if (!/hope|connection|joy|pride|resilience|community/i.test(improved.storytelling || '')) {
      try {
        const rebalancePrompt = `Restore emotional resonance without losing bravery:
Campaign: ${JSON.stringify(improved, null, 2)}`;
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
      ...Object.entries(SUSTAINABILITY_EXECUTION_REPLACEMENTS)
        .filter(([pattern]) => executions.some(e => new RegExp(pattern, 'i').test(e)))
        .flatMap(([, replacements]) => replacements),
      getStrategicSpike(input.brand, creativeInsights[0])
    ];
    
    // New optimized execution processing pipeline:
    const strongExecutions = upgradedExecutions.filter(validateExecution);
    let topExecutions = enforceExecutionDiversity(
      selectTopBraveExecutions(strongExecutions)
    );
    
    // Add Cannes Spike only if truly needed
    const braveryScore = calculateBraveryMatrix({ executionPlan: topExecutions } as GeneratedCampaign);
    if ((braveryScore.environmentalBravery || 0) + braveryScore.culturalTension < 8) {
      topExecutions.unshift(
        `Cannes Spike: ${input.brand} Accountability Installation`
      );
    }
    
    executions = cleanExecutionSteps(topExecutions);

    // 5. Final assembly
    const campaign: GeneratedCampaign = {
      ...improved,
      executionPlan: executions,
      referenceCampaigns,
      creativeInsights: creativeInsights as MultilayeredInsight[],
      storytelling: "",
    };

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
      braveryMatrix: {
        ...calculateBraveryMatrix(campaign),
        matrix: calculateBraveryMatrix(campaign).matrix || []
      }
    };

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