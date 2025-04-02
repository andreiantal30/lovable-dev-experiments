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
### Cultural Tension Mapper + Insight Builder

You are a strategist working on a campaign in ${currentYear}. First, identify ONE cultural tension that is affecting the target audience at a macro level. Then generate 3 sharp insights derived from this tension that can fuel creative ideas.

**Target Audience:** ${audienceString}
**Brand:** ${input.brand}
**Industry:** ${input.industry}
**Campaign Objectives:** ${objectivesString}
**Emotional Appeal to Tap Into:** ${input.emotionalAppeal.join(', ')}

#### Step 1: Cultural Tension
Write 1 cultural tension as a string. This should reflect something happening in the world (social, economic, digital, generational) that’s affecting this audience’s worldview. Keep it punchy and inspiring. Example:
- “We’re more connected than ever, but feel lonelier than ever.”

#### Step 2: 3 Creative Insights
Now, based on that tension, write 3 audience insights:
- Make each one specific and emotionally grounded
- Show contradiction, behavior, or unmet needs
- Phrase each one as a powerful truth for creative teams

### Format:
Return a JSON object with two keys:
\`\`\`json
{
  "tension": "Macro tension here",
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ]
}
\`\`\`
`;

    const response = await generateWithOpenAI(prompt, config);
    const cleanedResponse = extractJsonFromResponse(response);

    try {
      const parsed = JSON.parse(cleanedResponse);
      if (parsed?.insights && Array.isArray(parsed.insights)) {
        return parsed.insights.slice(0, 3);
      }
    } catch (error) {
      console.error("Error parsing insight JSON:", error);
    }

    return [
      "The audience seeks authentic connections in an increasingly digital world.",
      "They value brands that understand their specific needs rather than generic solutions.",
      "They want to feel seen and validated through their brand choices."
    ];
  } catch (error) {
    console.error("Error generating creative insights:", error);
    return [];
  }
}