import { toast } from "sonner";
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { generateStorytellingNarrative } from './storytellingGenerator';
import { CampaignInput, GeneratedCampaign, CampaignVersion, ReferenceCampaign, CreativeInsight, MultilayeredInsight } from './campaign/types';
import { findSimilarCampaigns } from './campaign/campaignMatcher';
import { generatePenetratingInsights } from './campaign/creativeInsightGenerator';
import { createCampaignPrompt } from './campaign/campaignPromptBuilder';
import { extractJsonFromResponse, cleanExecutionSteps } from './campaign/utils';
import { getCreativeDevicesForStyle } from '@/data/creativeDevices';
import { getCachedCulturalTrends } from '@/data/culturalTrends';
import { saveCampaignToLibrary } from './campaignStorage';
import { evaluateCampaign } from './campaign/evaluateCampaign';
import { ExtendedCampaignEvaluation } from './campaign/types';

const BACKEND_URL = 'https://animated-capybara-jj9qrx9r77pwc5qwj-8090.app.github.dev';

interface BraveryMatrix {
  physicalIntervention: number;
  institutionalChallenge: number;
  personalRisk: number;
  culturalTension: number;
  novelty: number;
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

// ================== TYPE GUARDS ================== //
function isMultilayered(insight: CreativeInsight): insight is MultilayeredInsight {
  return !!insight.systemicRoot && !!insight.emotionalParadox && !!insight.culturalTension;
}

// ================== INSIGHT DEEPENING ================== //
const deepenInsights = async (
  insights: CreativeInsight[], 
  config: OpenAIConfig
): Promise<MultilayeredInsight[]> => {
  const prompt = `Transform these insights into multilayered versions by adding:
  1. Systemic root cause (institutional/environmental factors)
  2. Emotional paradox (contradictory feelings)
  3. Cultural tension (social dynamics)

  Insights: ${JSON.stringify(insights)}

  Return JSON array with matching length: 
  { systemicRoot: string, emotionalParadox: string, culturalTension: string }[]`;

  try {
    const response = await generateWithOpenAI(prompt, config);
    const deepAnalysis: Partial<MultilayeredInsight>[] = JSON.parse(extractJsonFromResponse(response));

    return insights.map((insight, i) => ({
      ...insight,
      systemicRoot: deepAnalysis[i]?.systemicRoot || 'Systemic analysis pending',
      emotionalParadox: deepAnalysis[i]?.emotionalParadox || 'Paradox analysis pending',
      culturalTension: deepAnalysis[i]?.culturalTension || 'Tension analysis pending'
    }));
  } catch (error) {
    console.error("Insight deepening failed:", error);
    // Fallback to basic insights with required fields
    return insights.map(insight => ({
      ...insight,
      systemicRoot: 'Systemic analysis failed',
      emotionalParadox: 'Paradox analysis failed',
      culturalTension: 'Tension analysis failed'
    }));
  }
};

// ================== BRAVERY SYSTEM ================== //
const calculateBraveryMatrix = (campaign: GeneratedCampaign): BraveryMatrix => {
  const text = JSON.stringify(campaign).toLowerCase();
  return {
    physicalIntervention: +(/(interrupt|hijack|vandal|occup|block)/i.test(text)) * 3,
    institutionalChallenge: +(/(government|police|university|hospital|council)/i.test(text)) * 2,
    personalRisk: +(/(confess|vulnerable|expose|embarrass)/i.test(text)) * 1.5,
    culturalTension: +(/(gender|race|class|privilege|inequality)/i.test(text)) * 3.5,
    novelty: 5 - +(/(tiktok|ar experience|pop-up|docuseries)/i.test(text)) * 2
  };
};

type BrandCategory = 'coffee' | 'tech' | 'fashion' | 'finance' | 'automotive';
type TensionIdeas = Record<string, string>;

const tensionMap: Record<BrandCategory, TensionIdeas> = {
  coffee: {
    "financial anxiety": "Public 'Latte Tax' protests where baristas charge bankers 300% more",
    "social isolation": "Anonymous coffee dates with political opposites"
  },
  tech: {
    "surveillance": "Data donation stations in tech HQ lobbies",
    "addiction": "App detox challenges with smashed phone sculptures"
  },
  fashion: {
    "waste": "Clothing swap with homeless shelters",
    "exploitation": "Factory worker-designed luxury items"
  },
  finance: {
    "inequality": "Reverse ATMs that distribute bank profits",
    "debt": "Credit score funerals in bank lobbies"
  },
  automotive: {
    "pollution": "Exhaust fume art installations",
    "urban sprawl": "Car-bike hybrid vehicle protests"
  }
};

const getStrategicSpike = (brand: string, insight: CreativeInsight): string => {
  try {
    const brandKey = brand.toLowerCase() as BrandCategory;
    const brandTensions = tensionMap[brandKey] || {};

    const insightText = isMultilayered(insight) 
      ? `${insight.surfaceInsight} ${insight.culturalTension}`
      : insight.surfaceInsight;

    for (const [tension, idea] of Object.entries(brandTensions)) {
      if (insightText.toLowerCase().includes(tension.toLowerCase())) {
        return idea;
      }
    }
    return getCannesSpikeExecution(brandKey);
  } catch (error) {
    console.error("Strategic spike generation failed:", error);
    return getCannesSpikeExecution('generic');
  }
};

const getCannesSpikeExecution = (brand: BrandCategory | 'generic'): string => {
  const spikes: Record<BrandCategory | 'generic', string[]> = {
    coffee: [
      "Barista bailout fund - tip jars for laid-off workers",
      "Reverse coffee truck that gives free coffee to protestors"
    ],
    tech: [
      "Obsolete tech graveyard outside Apple Stores",
      "Algorithm transparency picket lines"
    ],
    fashion: [
      "Clothing swap with homeless shelters",
      "Runway show with garment worker models"
    ],
    finance: [
      "Burn fake money outside banks",
      "Credit score forgiveness booths"
    ],
    automotive: [
      "Car-free day hijinks",
      "Gas pump price tag protests"
    ],
    generic: [
      "Public confrontation with industry leaders",
      "Guerrilla protest in corporate headquarters"
    ]
  };

  const categorySpikes = spikes[brand] || spikes.generic;
  return categorySpikes[Math.floor(Math.random() * categorySpikes.length)];
};

// ================== DISRUPTION ENGINE ================== //
const disruptOnAllAxes = async (
  campaign: GeneratedCampaign, 
  config: OpenAIConfig
): Promise<GeneratedCampaign> => {
  const disruptionAxes = [
    { 
      name: "Medium", 
      test: /digital|app|online/, 
      fix: "Convert to physical protest with real-world consequences" 
    },
    { 
      name: "Tone", 
      test: /fun|playful|game/, 
      fix: "Make it confrontational and uncomfortable" 
    },
    { 
      name: "Agency", 
      test: /user|participant|player/, 
      fix: "Force institutional response through collective action" 
    }
  ];

  let modified = {...campaign};
  for (const axis of disruptionAxes) {
    if (axis.test.test(JSON.stringify(modified))) {
      const prompt = `Take this ${axis.name} axis from safe to brave:
Current: ${JSON.stringify(modified, null, 2)}
Requirement: ${axis.fix}
Return ONLY the modified JSON`;
      
      try {
        const response = await generateWithOpenAI(prompt, config);
        modified = JSON.parse(extractJsonFromResponse(response));
      } catch (error) {
        console.error(`Disruption on ${axis.name} failed:`, error);
      }
    }
  }
  return modified;
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

const selectTopBraveExecutions = (executions: string[]): string[] => {
  const scored = executions.map(ex => ({
    ex,
    score: calculateBraveryMatrix({ executionPlan: [ex] } as GeneratedCampaign).culturalTension
  }));
  return scored.sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map(s => s.ex);
};

// ================== CORE GENERATOR ================== //
export const generateCampaign = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // 1. Generate foundational elements
    const rawInsights = await generatePenetratingInsights(input, openAIConfig);
    const creativeInsights = await deepenInsights(rawInsights, openAIConfig);
    const referenceCampaigns = (await findSimilarCampaigns(input, openAIConfig))
      .filter(ref => ref.year); // Ensure we only include campaigns with years
    const creativeDevices = getCreativeDevicesForStyle(input.campaignStyle, 3);
    const culturalTrends = getCachedCulturalTrends();
    const relevantTrends = culturalTrends.sort(() => Math.random() - 0.5).slice(0, 3);

    // 2. Create initial campaign
    const prompt = createCampaignPrompt(
      input, 
      referenceCampaigns, 
      creativeInsights, 
      creativeDevices, 
      relevantTrends
    );
    const raw = await generateWithOpenAI(prompt, openAIConfig);
    let parsed: GeneratedCampaign = JSON.parse(extractJsonFromResponse(raw));

    // 3. Creative Director pass
    console.group('🎭 Creative Director Pass');
    const improved = await disruptOnAllAxes(parsed, openAIConfig);
    console.log('Pre-CD:', JSON.stringify(parsed, null, 2));
    console.log('Post-CD:', JSON.stringify(improved, null, 2));
    console.groupEnd();

    // 4. Execution plan refinement
    let executions = improved.executionPlan || [];
    executions = upgradeWeakExecutions(executions);
    executions.push(getStrategicSpike(input.brand, creativeInsights[0]));
    executions = selectTopBraveExecutions(executions);
    executions = cleanExecutionSteps(executions);

    // 5. Final assembly
    const campaign: GeneratedCampaign = {
      ...improved,
      executionPlan: executions,
      referenceCampaigns,
      creativeInsights,
      storytelling: "",
    };

 // 6. Generate narrative and evaluate
campaign.storytelling = (await generateStorytellingNarrative({
  brand: input.brand,
  industry: input.industry,
  targetAudience: input.targetAudience,
  emotionalAppeal: input.emotionalAppeal,
  campaignName: campaign.campaignName,
  keyMessage: campaign.keyMessage,
}, openAIConfig)).narrative;

const evaluation = await evaluateCampaign(campaign, { brand: input.brand, industry: input.industry }, openAIConfig) as ExtendedCampaignEvaluation;
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