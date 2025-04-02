// server/disruptiveDeviceInjector.ts

import OpenAI from 'openai';

type CampaignOutput = {
  campaignName: string;
  keyMessage: string;
  creativeStrategy: string[];
  executionPlan: string[];
  viralHook: string;
  consumerInteraction: string;
  expectedOutcomes: string[];
  viralElement: string;
  callToAction: string;
  creativeInsights: string[];
  prHeadline?: string;
  evaluation?: any;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function injectDisruptiveDevice(campaign: CampaignOutput): Promise<CampaignOutput> {
  try {
    const prompt = `
You're a disruptive creative thinker. Review the following campaign and inject one unexpected creative twist that would make it more bold, viral, or culturally subversive.

Use techniques like:
- Hijacking rituals
- Breaking norms
- Turning the medium against itself
- Revealing hidden tensions
- Forcing participation
- Creating friction

Return the improved campaign in the same JSON format, rewriting only what's needed.

CAMPAIGN:
\`\`\`json
${JSON.stringify(campaign, null, 2)}
\`\`\`
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
    });

    const raw = response.choices?.[0]?.message?.content || '{}';

    let parsed: any = null;

    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.warn("Standard JSON parse failed, attempting fallback extraction...");
      const fallbackMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
      if (fallbackMatch) {
        try {
          parsed = JSON.parse(fallbackMatch[1] || fallbackMatch[0]);
        } catch (fallbackError) {
          console.error("Fallback JSON parse failed:", fallbackError);
        }
      }
    }

    if (parsed && typeof parsed === 'object') {
      console.log("✅ Disruptive device injected successfully.");
      return {
        ...campaign,
        ...parsed
      };
    }

    console.warn("⚠️ Could not extract valid disruptive content. Returning original campaign.");
    return campaign;
  } catch (error) {
    console.error("❌ Error in injectDisruptiveDevice:", error);
    return campaign;
  }
}
