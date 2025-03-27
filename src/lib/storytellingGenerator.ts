import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';

interface StorytellingInput {
  brand: string;
  industry: string;
  targetAudience: string[];
  emotionalAppeal: string[];
  campaignName: string;
  keyMessage: string;
}

/**
 * Generate a storytelling narrative based on campaign inputs
 */
export async function generateStorytellingNarrative(
  input: StorytellingInput,
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<string> {
  const prompt = `
You're a top-tier brand storyteller.

Your task is to turn a campaign idea into a human, emotionally resonant narrative that could be used in a voiceover, manifesto film, or about section of a case study. 

Tone: authentic, vivid, emotionally insightful — not cheesy or generic.

Here’s the campaign input:

- Brand: ${input.brand}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience.join(", ")}
- Emotional Appeal: ${input.emotionalAppeal.join(", ")}
- Campaign Name: ${input.campaignName}
- Key Message: ${input.keyMessage}

Please return only the storytelling narrative as plain text. Do NOT include explanations, formatting, or headings.
`;

  try {
    const response = await generateWithOpenAI(prompt, openAIConfig);
    return response.trim();
  } catch (error) {
    console.error("Failed to generate storytelling narrative:", error);
    throw error;
  }
}
