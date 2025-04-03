import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
}

/**
 * Generate multi-layered creative insights for campaign generation
 */
export async function generateCreativeInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<MultiLayeredInsight[]> {
  try {
    const currentYear = new Date().getFullYear();
    const audienceString = input.targetAudience.join(', ');
    const objectivesString = input.objectives.join(', ');

    const prompt = `
### Cultural Tension Mapper – Insight Depth Booster

You're a strategist working on a campaign in ${currentYear}.

Step 1: Identify a cultural tension affecting this audience.
Step 2: Turn it into 3 layered insights using this format:

{
  "surfaceInsight": "What the audience visibly experiences or does",
  "emotionalUndercurrent": "The unspoken feeling, fear, or desire beneath it",
  "creativeUnlock": "How the brand can flip that tension into power or participation"
}

Avoid clichés. Make it sharp and campaign-worthy.

— Audience Context —
Target Audience: ${audienceString}
Brand: ${input.brand}
Industry: ${input.industry}
Campaign Objectives: ${objectivesString}
Emotional Appeal: ${input.emotionalAppeal.join(', ')}

Return ONLY a JSON array of 3 objects with this structure.
`;

    const response = await generateWithOpenAI(prompt, config);
    const cleanedResponse = extractJsonFromResponse(response);

    const parsed = JSON.parse(cleanedResponse);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
    throw new Error("Invalid or empty parsed insights");
  } catch (error) {
    console.error("⚠️ Error generating multi-layered insights:", error);
    return [
      {
        surfaceInsight: "Young adults are overwhelmed by ‘optimized’ self-improvement culture.",
        emotionalUndercurrent: "They quietly feel like failures for not always being productive.",
        creativeUnlock: "Let the brand celebrate real rest as rebellion."
      }
    ];
  }
}