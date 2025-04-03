import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
}

/**
 * Generate a single sharp creative insight using the strongest tension
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
### Cultural Tension Mapper – Focused Insight Builder

You're a top strategist writing in ${currentYear}. Your job is to uncover ONE tension-based insight worth building a campaign around.

Return a single JSON object in this format:
{
  "surfaceInsight": "What the audience visibly experiences or does",
  "emotionalUndercurrent": "The surprising or unspoken emotional drive underneath it",
  "creativeUnlock": "How the brand can flip that tension into something culturally bold or empowering"
}

Make it specific, tension-rich, and useful for a bold campaign idea. Avoid clichés.

— Audience Context —
Target Audience: ${audienceString}
Brand: ${input.brand}
Industry: ${input.industry}
Campaign Objectives: ${objectivesString}
Emotional Appeal: ${input.emotionalAppeal.join(', ')}
`;

    const response = await generateWithOpenAI(prompt, config);
    const cleanedResponse = extractJsonFromResponse(response);
    const parsed = JSON.parse(cleanedResponse);

    if (parsed && parsed.surfaceInsight && parsed.emotionalUndercurrent && parsed.creativeUnlock) {
      return [parsed]; // Return as array for compatibility
    }
    throw new Error("Invalid or missing insight fields in response");
  } catch (error) {
    console.error("⚠️ Error generating focused insight:", error);
    return [
      {
        surfaceInsight: "Young adults are overwhelmed by ‘optimized’ self-improvement culture.",
        emotionalUndercurrent: "They quietly feel like failures for not always being productive.",
        creativeUnlock: "Let the brand celebrate real rest as rebellion."
      }
    ];
  }
}
