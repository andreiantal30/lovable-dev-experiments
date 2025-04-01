
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';

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
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<StorytellingOutput> {
  const prompt = `
You're a top-tier brand storyteller tasked with creating a powerful narrative.

Your task is to turn a campaign idea into a human, emotionally resonant narrative that could be used in a voiceover, manifesto film, or about section of a case study. 

Tone: authentic, vivid, emotionally insightful — not cheesy or generic. Use sensory language, compelling metaphors, and rhythm to create a narrative that resonates with the target audience.

Here's the campaign input:

- Brand: ${input.brand}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience.join(", ")}
- Emotional Appeal: ${input.emotionalAppeal.join(", ")}
- Campaign Name: ${input.campaignName}
- Key Message: ${input.keyMessage}

Create a story that:
- Opens with an emotionally resonant hook
- Builds tension or curiosity
- Contains vivid, sensory details
- Has an authentic human voice
- Connects to deeper emotional truths
- Resolves in a way that reinforces the key message
- Is between 150-200 words

Please return only the storytelling narrative as plain text. Do NOT include explanations, formatting, or headings.
`;

  try {
    const response = await generateWithOpenAI(prompt, openAIConfig);
    return { narrative: response.trim() };
  } catch (error) {
    console.error("Failed to generate storytelling narrative:", error);
    throw error;
  }
}
