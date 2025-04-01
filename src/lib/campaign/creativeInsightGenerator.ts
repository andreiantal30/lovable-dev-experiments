
import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

/**
 * Generate creative insights for campaign generation
 */
export async function generateCreativeInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<string[]> {
  try {
    const currentYear = new Date().getFullYear();
    const audienceString = input.targetAudience.join(', ');
    const objectivesString = input.objectives.join(', ');
    
    const prompt = `
### Creative Insight Builder

Generate 3 powerful insights about the target audience that will unlock creative potential for this campaign. 
These should be tensions, truths, or emotional realities that the target audience experiences in ${currentYear}.

**Target Audience:** ${audienceString}
**Brand:** ${input.brand}
**Industry:** ${input.industry}
**Campaign Objectives:** ${objectivesString}
**Emotional Appeal to Tap Into:** ${input.emotionalAppeal.join(', ')}

For each insight:
1. Focus on a specific tension or truth that the audience feels
2. Make it specific, not generic
3. Connect it to the brand's ability to solve or provoke this tension
4. Phrase it as a simple, powerful statement that could inspire creative work

Format your response as a JSON array of exactly 3 insights:
\`\`\`json
["Insight statement 1", "Insight statement 2", "Insight statement 3"]
\`\`\`

The best insights will reveal something that feels true but hasn't been overly exploited in marketing.
`;

    const response = await generateWithOpenAI(prompt, config);
    const cleanedResponse = extractJsonFromResponse(response);
    
    try {
      const insights = JSON.parse(cleanedResponse);
      if (Array.isArray(insights) && insights.length > 0) {
        return insights.slice(0, 3);
      }
    } catch (error) {
      console.error("Error parsing creative insights:", error);
    }
    
    return ["The audience seeks authentic connections in an increasingly digital world.",
            "They value brands that understand their specific needs rather than generic solutions.",
            "They want to feel seen and validated through their brand choices."];
  } catch (error) {
    console.error("Error generating creative insights:", error);
    return [];
  }
}
