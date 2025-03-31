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
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function applyCreativeDirectorPass(generatedCampaign: CampaignOutput): Promise<CampaignOutput> {
  const prompt = `
You are a Cannes Lions-winning Creative Director. Improve this marketing campaign with sharper naming, cultural tension, emotional storytelling, and creative boldness.

Keep the format and structure the same. Do not return explanations—just the final JSON.

CAMPAIGN:
\`\`\`json
${JSON.stringify(generatedCampaign, null, 2)}
\`\`\`
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const raw = response.choices?.[0]?.message?.content || '{}';
  return JSON.parse(raw);
}