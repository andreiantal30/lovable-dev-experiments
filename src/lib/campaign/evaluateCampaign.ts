import { CampaignEvaluation, GeneratedCampaign } from "./types";
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from "../openai";
import { extractJsonFromResponse } from "./utils";

interface EvaluationContext {
  brand: string;
  industry: string;
}

export const evaluateCampaign = async (
  campaign: GeneratedCampaign,
  context: EvaluationContext,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<CampaignEvaluation> => {
  try {
    const referenceCampaigns = campaign.referenceCampaigns || [];

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
- Generic “feel good” messaging without insight

— CAMPAIGN TO EVALUATE —
Name: ${campaign.campaignName}
Brand: ${context.brand}
Industry: ${context.industry}
Key Message: ${campaign.keyMessage}
Creative Strategy: ${campaign.creativeStrategy.join("; ")}
Execution Plan: ${campaign.executionPlan.join("; ")}
Creative Insights: ${campaign.creativeInsights?.join("; ") || "None"}
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

    return parsed;
  } catch (err) {
    console.error("🧠 Evaluation error:", err);
    return {
      insightSharpness: 5,
      ideaOriginality: 5,
      executionPotential: 5,
      awardPotential: 5,
      finalVerdict: "Evaluation failed. Default scores applied."
    };
  }
};