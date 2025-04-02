import { generateWithOpenAI, OpenAIConfig } from './openai';

export interface StorytellingInput {
  brand: string;
  industry: string;
  targetAudience: string[];
  emotionalAppeal: string[];
  campaignName: string;
  keyMessage: string;
}

export interface StorytellingOutput {
  narrative: string;
  storyNarrative?: string;
  protagonistDescription?: string;
  conflictDescription?: string;
  resolutionDescription?: string;
  brandValueConnection?: string;
  audienceRelevance?: string;
}

/**
 * Generate a storytelling narrative based on campaign inputs
 */
export async function generateStorytellingNarrative(
  input: StorytellingInput,
  openAIConfig?: OpenAIConfig
): Promise<StorytellingOutput> {
  const prompt = `
You're a top-tier brand storyteller writing a 2025 Cannes Lions case film voiceover.

Your task is to transform this campaign into a powerful, emotionally resonant story — something that could open a manifesto film, captivate a jury, or move an audience.

Here's the campaign data:
- Brand: ${input.brand}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience.join(", ")}
- Emotional Appeal: ${input.emotionalAppeal.join(", ")}
- Campaign Name: ${input.campaignName}
- Key Message: ${input.keyMessage}

Write a 150–200 word story that:
- Starts with a punchy human insight or cultural tension
- Builds emotional stakes with specificity and rhythm
- Includes sensory details or a vivid metaphor
- Makes the audience *feel* the conflict or need
- Resolves with how the brand or idea steps in
- Feels like something you'd hear in a winning case film VO

Avoid cliché lines. Use a grounded, evocative, confident tone.

Return only the final story as plain text — no titles, no formatting, no notes.
`;

  try {
    const response = await generateWithOpenAI(prompt, openAIConfig);
    return { narrative: response.trim() };
  } catch (error) {
    console.error("Failed to generate storytelling narrative:", error);
    throw error;
  }
}