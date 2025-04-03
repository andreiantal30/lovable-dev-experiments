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
You're a disruptive creative director. Review the following campaign and inject ONE creative twist that challenges norms or adds cultural sharpness.

Use techniques like:
- Hijacking rituals (e.g. turning a boring moment into something big)
- Forcing co-creation (e.g. people must collaborate to unlock the result)
- Turning the medium against itself (e.g. use a billboard to shame billboard culture)
- Creating friction or tension (e.g. opposing emotions, unexpected consequences)
- Social sabotage (e.g. letting people sabotage or remix the campaign)

Add your twist where it naturally fits: executionPlan, viralHook, or callToAction.
Rewrite only what’s needed. Return the result in valid JSON.

CAMPAIGN:
\`\`\`json
${JSON.stringify(campaign, null, 2)}
\`\`\`
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const raw = response.choices?.[0]?.message?.content || '';

    let cleaned = '';
    const markdownMatch = raw.match(/```json\s*([\s\S]*?)```/);
    if (markdownMatch) {
      cleaned = markdownMatch[1];
    } else {
      const braceMatch = raw.match(/\{[\s\S]*\}/);
      if (braceMatch) cleaned = braceMatch[0];
    }

    let parsed: Partial<CampaignOutput> = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse disruptive response JSON:", err);
      return campaign;
    }

    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn("⚠️ Invalid disruptive format. Returning original campaign.");
      return campaign;
    }

    const updated = {
      ...campaign,
      ...parsed
    };

    console.log("✅ Disruptive twist injected.");
    return updated;

  } catch (error: any) {
    console.error("❌ Error in injectDisruptiveDevice:");
    if (error.response) {
      console.error("OpenAI error status:", error.response.status);
      console.error("OpenAI error data:", error.response.data);
    } else {
      console.error(error.stack || error.message || error);
    }
    return campaign;
  }
}