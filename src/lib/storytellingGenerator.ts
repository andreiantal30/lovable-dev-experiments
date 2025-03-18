
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
  storyNarrative: string;
  protagonistDescription: string;
  conflictDescription: string;
  resolutionDescription: string;
  brandValueConnection: string;
  audienceRelevance: string;
}

/**
 * Creates a prompt for the OpenAI API to generate a compelling campaign story
 */
const createStorytellingPrompt = (input: StorytellingInput): string => {
  return `
Generate a compelling storytelling narrative for the following marketing campaign:

CAMPAIGN INFORMATION:
Brand: ${input.brand}
Industry: ${input.industry}
Target Audience: ${input.targetAudience.join(', ')}
Emotional Appeal: ${input.emotionalAppeal.join(', ')}
Campaign Name: ${input.campaignName}
Key Message: ${input.keyMessage}

Create a narrative arc that resonates with the target audience and embodies the brand's values.
Structure your response as a JSON object with the following components:

1. storyNarrative: A concise overview of the campaign's story (150-200 words)
2. protagonistDescription: A description of the protagonist or main character(s) in the story
3. conflictDescription: The central conflict or challenge in the narrative
4. resolutionDescription: How the conflict is resolved, highlighting the brand's role
5. brandValueConnection: How the story connects with the brand's core values
6. audienceRelevance: Why this story will resonate with the target audience

Format your response as JSON in the following structure:
{
  "storyNarrative": "Story overview here...",
  "protagonistDescription": "Protagonist description here...",
  "conflictDescription": "Conflict description here...",
  "resolutionDescription": "Resolution description here...",
  "brandValueConnection": "Brand value connection here...",
  "audienceRelevance": "Audience relevance explanation here..."
}

Make the narrative authentic, emotionally engaging, and aligned with current storytelling best practices.
`;
};

/**
 * Extracts JSON from a potentially markdown-formatted string
 */
const extractJsonFromResponse = (text: string): string => {
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return text.trim();
};

/**
 * Generates a storytelling narrative for a campaign
 */
export const generateStorytellingNarrative = async (
  input: StorytellingInput,
  openAIConfig: OpenAIConfig
): Promise<StorytellingOutput> => {
  try {
    const prompt = createStorytellingPrompt(input);
    const response = await generateWithOpenAI(prompt, openAIConfig);
    const cleanedResponse = extractJsonFromResponse(response);
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Error generating storytelling narrative:", error);
    throw error;
  }
};
