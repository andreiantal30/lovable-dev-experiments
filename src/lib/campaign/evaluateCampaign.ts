import { CampaignEvaluation, GeneratedCampaign } from "./types";
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from "../openai";
import { extractJsonFromResponse } from "./utils";
import { findSimilarCampaigns } from "./campaignMatcher";

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
You are an award-winning creative director evaluating the quality of an AI-generated campaign. 

Your feedback must be sharp, specific, and varied. Use the scoring system below and include a compelling one-line final verdict. Compare this campaign against global Cannes Lions standards.

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
${referenceBrief}

— EVALUATION FORMAT —
Return a JSON object with the following fields:
{
  "insightSharpness": number (1–10),
  "ideaOriginality": number (1–10),
  "executionPotential": number (1–10),
  "awardPotential": number (1–10),
  "finalVerdict": string — a smart one-line opinion, no fluff
}
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