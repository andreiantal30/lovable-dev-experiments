import { OpenAIConfig, generateWithOpenAI } from '../openai';
import { extractJsonFromResponse } from './utils';
import { MultilayeredInsight } from './types';

export async function boostCreativeStrategy(
  existing: string[],
  insight: MultilayeredInsight,
  config: OpenAIConfig
): Promise<string[]> {
  const prompt = `
You're a Cannes-winning creative strategist.

Your job is to rewrite and upgrade this list of campaign strategies. Make them more:
- bold,
- emotionally resonant,
- creatively daring,
- and tailored to this insight.

--- INPUT ---
Existing strategies: ${JSON.stringify(existing, null, 2)}

Insight:
- Surface Insight: ${insight.surfaceInsight}
- Emotional Undercurrent: ${insight.emotionalUndercurrent}
- Systemic Hypocrisy: ${insight.systemicHypocrisy}
- Action Paradox: ${insight.actionParadox}
- Irony: ${insight.irony}
- Brand Complicity: ${insight.brandComplicity}

Return an array of 3–5 upgraded strategy lines that could headline a bold campaign.

Format:
[
  "Strategy Line 1",
  "Strategy Line 2",
  ...
]
`;

  try {
    const response = await generateWithOpenAI(prompt, config);
    const strategyList = JSON.parse(extractJsonFromResponse(response));
    return Array.isArray(strategyList) ? strategyList : existing;
  } catch (error) {
    console.error("⚠️ Strategy Boosting Failed:", error);
    return existing;
  }
}