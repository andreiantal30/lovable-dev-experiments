import { CampaignEvaluation, GeneratedCampaign } from "./types";
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from "../openai";
import { extractJsonFromResponse } from "./utils";

interface EvaluationContext {
  brand: string;
  industry: string;
}

interface BraveryScore {
  score: number;
  breakdown: {
    physicalIntervention: boolean;
    challengesAuthority: boolean;
    culturalTension: boolean;
    personalRisk: boolean;
  };
  suggestions: string[];
}

const BRAVERY_PATTERNS = [
  {
    regex: /(interrupt|hijack|vandal|takeover|occup|block|barricade)/i,
    points: 3,
    type: 'physicalIntervention',
    suggestion: 'Add real-world physical intervention'
  },
  {
    regex: /(government|police|school|university|hospital|city council)/i,
    points: 3,
    type: 'challengesAuthority',
    suggestion: 'Make the challenge to authority more explicit'
  },
  {
    regex: /(gender|race|class|privilege|inequality|climate denial)/i,
    points: 4,
    type: 'culturalTension',
    suggestion: 'Highlight the cultural or societal tension more boldly'
  },
  {
    regex: /(embarrass|confess|vulnerable|expose|naked truth)/i,
    points: 2,
    type: 'personalRisk',
    suggestion: 'Include more personal or emotional vulnerability'
  },
];

const calculateBraveryScore = (campaign: any): BraveryScore => {
  let score = 0;
  const breakdown = {
    physicalIntervention: false,
    challengesAuthority: false,
    culturalTension: false,
    personalRisk: false
  };
  const suggestions: string[] = [];

  const campaignText = JSON.stringify(campaign).toLowerCase();

  BRAVERY_PATTERNS.forEach(pattern => {
    if (pattern.regex.test(campaignText)) {
      score += pattern.points;
      breakdown[pattern.type] = true;
      suggestions.push(pattern.suggestion);
    }
  });

  return { score, breakdown, suggestions };
};

export const evaluateCampaign = async (
  campaign: GeneratedCampaign,
  context: EvaluationContext,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<CampaignEvaluation> => {
  try {
    const referenceCampaigns = campaign.referenceCampaigns || [];
    const braveryScore = calculateBraveryScore(campaign);

    const referenceBrief = referenceCampaigns.slice(0, 3).map(ref => {
      return `- ${ref.name} (${ref.brand}, ${ref.year}) – ${ref.keyMessage}`;
    }).join("\n");

    const prompt = `
You are an award-winning creative director reviewing a marketing campaign. Your role is to score it like a Cannes Lions juror. Be sharp, opinionated, and honest.

Evaluate not just the logic of the idea, but the **creative bravery**, **emotional power**, and **execution originality**.

Ask yourself:
- Would this make other creatives jealous?
- Does it punch above its weight?
- Could this spark conversation, imitation, or cultural shift?

Do NOT reward:
- Safe or familiar formats
- Gimmicky tech without depth
- Overused influencer or UGC tropes
- Generic "feel good" messaging without insight

— CAMPAIGN TO EVALUATE —
Name: ${campaign.campaignName}
Brand: ${context.brand}
Industry: ${context.industry}
Key Message: ${campaign.keyMessage}
Creative Strategy: ${campaign.creativeStrategy?.join("; ") || "None"}
Execution Plan: ${campaign.executionPlan?.join("; ") || "None"}
Creative Insights: ${campaign.creativeInsights?.map(ci => ci.surfaceInsight).join("; ") || "None"}
Emotional Appeal: ${campaign.emotionalAppeal?.join(", ") || "None"}
Call to Action: ${campaign.callToAction || campaign.consumerInteraction || "None"}

— SIMILAR REFERENCE CAMPAIGNS —
${referenceBrief || "None"}

— EVALUATION FORMAT —
Return a JSON object like this:
\`\`\`json
{
  "insightSharpness": number (1–10),
  "ideaOriginality": number (1–10),
  "executionPotential": number (1–10),
  "awardPotential": number (1–10),
  "finalVerdict": "One bold, witty sentence that summarizes your creative POV."
}
\`\`\`
    `.trim();

    const response = await generateWithOpenAI(prompt, openAIConfig);
    const cleaned = extractJsonFromResponse(response);
    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      creativeBravery: Math.min(10, Math.max(1, Math.round(braveryScore.score / 1.2))),
      braveryBreakdown: braveryScore.breakdown,
      braverySuggestions: braveryScore.suggestions
    };
  } catch (err) {
    console.error("🧠 Evaluation error:", err);
    return {
      insightSharpness: 5,
      ideaOriginality: 5,
      executionPotential: 5,
      awardPotential: 5,
      creativeBravery: 5,
      finalVerdict: "Evaluation failed. Default scores applied.",
      braveryBreakdown: {
        physicalIntervention: false,
        challengesAuthority: false,
        culturalTension: false,
        personalRisk: false
      },
      braverySuggestions: []
    };
  }
};
export { BRAVERY_PATTERNS, calculateBraveryScore };