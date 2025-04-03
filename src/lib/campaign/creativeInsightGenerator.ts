import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
}

// 🧠 Insight scoring logic – prioritize sharpness
const scoreInsight = (insight: MultiLayeredInsight): number => {
  let score = 0;

  // Contradiction
  if (/but|however|yet|although|paradox/i.test(insight.surfaceInsight)) score += 3;

  // Cultural relevance
  if (/gen [a-z]|post-pandemic|climate [a-z]|digital [a-z]/i.test(insight.surfaceInsight)) score += 2;

  // Emotional charge
  if (/guilt|shame|fear|longing|belonging|identity/i.test(insight.emotionalUndercurrent)) score += 2;

  return score;
};

// 🧠 Focused prompt for primary insight
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
      return [parsed];
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

// 🧠 Generate sharper, more provocative contradictions
export async function generatePenetratingInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<MultiLayeredInsight[]> {
  try {
    const [base] = await generateCreativeInsights(input, config);

    const contradictionPrompt = `
Take this insight:
Surface Insight: "${base.surfaceInsight}"
Emotional Undercurrent: "${base.emotionalUndercurrent}"

Now give me 3 alternative contradictory insights that challenge this worldview, and push the cultural tension deeper.

Respond ONLY with a JSON array using this format:
[
  {
    "surfaceInsight": "...",
    "emotionalUndercurrent": "...",
    "creativeUnlock": "..."
  }
]
`;

    const contradictionResponse = await generateWithOpenAI(contradictionPrompt, config);
    const cleaned = extractJsonFromResponse(contradictionResponse);
    const contradictions = JSON.parse(cleaned);

    const all = [base, ...(Array.isArray(contradictions) ? contradictions : [])];
    const sorted = all.sort((a, b) => scoreInsight(b) - scoreInsight(a));
    return sorted.slice(0, 3);
  } catch (error) {
    console.error("⚠️ Error generating penetrating insights:", error);
    return [
      {
        surfaceInsight: "People crave transformation, but fear losing what makes them feel safe.",
        emotionalUndercurrent: "They want change without chaos.",
        creativeUnlock: "Let the brand become a guide that respects their past while opening new doors."
      }
    ];
  }
}