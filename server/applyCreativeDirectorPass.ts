import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load root-level .env regardless of current working directory
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

import OpenAI from 'openai';
import { extractJsonFromResponse } from '../src/lib/campaign/utils';

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
  apiKey: process.env.OPENAI_API_KEY!, // <- patched here
});

/**
 * Improve a campaign using a Cannes-winning CD pass — and fail gracefully if OpenAI fails.
 */
export async function applyCreativeDirectorPass(generatedCampaign: CampaignOutput): Promise<CampaignOutput> {
  const prompt = `
You are a Cannes Lions-winning Creative Director. Improve this marketing campaign with sharper naming, cultural tension, emotional storytelling, and creative boldness.

Keep the format and structure the same. Do not return explanations—just the final JSON.

CAMPAIGN:
\`\`\`json
${JSON.stringify(generatedCampaign, null, 2)}
\`\`\`
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = response.choices?.[0]?.message?.content || '{}';
    const cleaned = extractJsonFromResponse(raw);

    try {
      return JSON.parse(cleaned);
    } catch (parseError) {
      console.warn("⚠️ Failed to parse CD pass JSON. Using original campaign.");
      return generatedCampaign;
    }
  } catch (err) {
    console.error("❌ Creative Director pass failed:", err);
    return generatedCampaign;
  }
}