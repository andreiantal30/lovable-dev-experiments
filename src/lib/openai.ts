import { toast } from "sonner";
import { CampaignEvaluation } from "./campaign/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const STORAGE_KEY = "openai_api_key";

const isBrowser = typeof window !== "undefined";

const getStoredApiKey = (): string =>
  isBrowser
    ? localStorage.getItem(STORAGE_KEY) || ""
    : process.env.OPENAI_API_KEY || "";

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export const defaultOpenAIConfig: OpenAIConfig = {
  apiKey: getStoredApiKey(),
  model: "gpt-4o",
};

console.log(
  "OpenAI: API key source:",
  isBrowser
    ? localStorage.getItem(STORAGE_KEY)
      ? "Found in localStorage"
      : "Not found in localStorage"
    : process.env.OPENAI_API_KEY
    ? "Found in .env"
    : "Not found in .env"
);

export async function generateWithOpenAI(
  prompt: string,
  config: OpenAIConfig = defaultOpenAIConfig
): Promise<string> {
  const apiKey = config.apiKey || getStoredApiKey();

  if (!apiKey) throw new Error("OpenAI API key is not provided");

  console.log("OpenAI: Making API request with model:", config.model);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error response:", error);
      throw new Error(error.error?.message || "Error generating content with OpenAI");
    }

    const data = await response.json();
    console.log("OpenAI: Received successful response");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export async function evaluateCampaign(
  campaign: any,
  config: OpenAIConfig = defaultOpenAIConfig
): Promise<CampaignEvaluation> {
  const apiKey = config.apiKey || getStoredApiKey();

  if (!apiKey) throw new Error("OpenAI API key is not provided");

  const campaignString = `
Campaign Name: ${campaign.campaignName}
Key Message: ${campaign.keyMessage}
Creative Strategy: ${Array.isArray(campaign.creativeStrategy) ? campaign.creativeStrategy.join(", ") : campaign.creativeStrategy}
Execution Plan: ${Array.isArray(campaign.executionPlan) ? campaign.executionPlan.join(", ") : campaign.executionPlan}
Viral Hook: ${campaign.viralHook || "N/A"}
Consumer Interaction: ${campaign.consumerInteraction || "N/A"}
Expected Outcomes: ${Array.isArray(campaign.expectedOutcomes) ? campaign.expectedOutcomes.join(", ") : campaign.expectedOutcomes}
Viral Element: ${campaign.viralElement || "N/A"}
Call to Action: ${campaign.callToAction || "N/A"}
`;

  const prompt = `
# Creative Director Review

As a seasoned creative director at a top agency, critique this campaign concept with an honest, unbiased assessment. Score each dimension on a scale of 1–10 and provide brief justification for each score.

## Campaign to Evaluate:
${campaignString}

## Evaluation Framework:
1. Insight Sharpness
2. Idea Originality
3. Execution Potential
4. Award Potential

## Response Format:
Respond with **only** this JSON (no backticks or formatting):

{
  "insightSharpness": 7,
  "ideaOriginality": 8,
  "executionPotential": 6,
  "awardPotential": 7,
  "finalVerdict": "One-line summary of your overall assessment."
}
`;

  try {
    console.log("🧠 Sending campaign evaluation prompt to OpenAI...");
    const response = await generateWithOpenAI(prompt, {
      apiKey,
      model: config.model,
    });

    const cleaned = response.trim().replace(/^```json\s*|\s*```$/g, "");
    const parsed = JSON.parse(cleaned);

    console.log("✅ Evaluation parsed:", parsed);
    return parsed as CampaignEvaluation;
  } catch (err) {
    console.error("❌ Error during evaluation call:", err);
    
    return {
      insightSharpness: 5,
      ideaOriginality: 5,
      executionPotential: 5,
      awardPotential: 5,
      creativeBravery: 5,
      braveryBreakdown: {
        physicalIntervention: false,
        challengesAuthority: false,
        culturalTension: false,
        personalRisk: false
      },
      braverySuggestions: [],
      finalVerdict: "Default fallback."
    };
  }
}

export function saveApiKeyToStorage(apiKey: string): void {
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEY, apiKey);
    toast.success("OpenAI API key saved!");
  }
}

export function getApiKeyFromStorage(): string {
  return isBrowser ? localStorage.getItem(STORAGE_KEY) || "" : "";
}