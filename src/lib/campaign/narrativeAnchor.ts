// narrativeAnchor.ts

import { GeneratedCampaign } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

/**
 * Injects a personal, human-centered narrative if the campaign storytelling lacks emotional anchoring.
 */
export async function injectNarrativeAnchor(
  campaign: GeneratedCampaign,
  config: OpenAIConfig
): Promise<string> {
  const needsAnchor = !/I\s(felt|remember|watched|lost)|they\s(struggled|sacrificed|resisted|confessed)/i.test(
    campaign.storytelling || ''
  );

  if (!needsAnchor) return campaign.storytelling || '';

  try {
    const prompt = `This campaign needs a human-centered anchor.
Create a short, emotionally resonant narrative (max 80 words) from a real or fictional POV that elevates the core message:

Campaign: ${JSON.stringify(campaign, null, 2)}

Output as:
{
  "narrative": "..."
}`;

    const response = await generateWithOpenAI(prompt, config);
    const parsed = JSON.parse(extractJsonFromResponse(response));
    return parsed.narrative || campaign.storytelling || '';
  } catch (err) {
    console.warn('⚠️ Narrative Anchor injection failed:', err);
    return campaign.storytelling || '';
  }
}
