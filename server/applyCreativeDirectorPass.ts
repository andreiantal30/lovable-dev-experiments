import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// CommonJS-compatible directory resolution
const __dirname = path.dirname(require.main?.filename || process.cwd());

// Load environment variables
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
  creativeInsights: Array<string | {
    surfaceInsight: string;
    emotionalUndercurrent?: string;
    creativeUnlock?: string;
  }>;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  timeout: 15000, // 15 second timeout
});

export async function applyCreativeDirectorPass(
  generatedCampaign: CampaignOutput
): Promise<CampaignOutput & { _cdModifications?: string[] }> {
  console.groupCollapsed('🎭 Creative Director Pass');
  console.log('📥 Input Campaign:', JSON.stringify(generatedCampaign, null, 2));

  const prompt = `
You are a Cannes Lions-winning Creative Director. Improve this campaign with:
1. Sharper naming/messaging
2. Heightened cultural tension
3. Emotional storytelling hooks
4. 1 disruptive element

RULES:
- Maintain original JSON structure
- Never remove elements
- Return ONLY modified JSON
- Track changes in _cdModifications array

CAMPAIGN:
\`\`\`json
${JSON.stringify(generatedCampaign, null, 2)}
\`\`\`
`.trim();

  try {
    console.time('⏱️ CD Pass API Call');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ 
        role: 'user', 
        content: prompt 
      }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    console.timeEnd('⏱️ CD Pass API Call');

    const raw = response.choices?.[0]?.message?.content || '{}';
    console.debug('📤 Raw API Response:', raw);

    const cleaned = extractJsonFromResponse(raw);
    let result: CampaignOutput;

    try {
      result = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('⚠️ JSON Parse Error:', parseError);
      throw new Error('Invalid JSON from CD pass');
    }

    const modifications = getModifications(generatedCampaign, result);
    if (modifications.length === 0) {
      console.warn('🔄 No meaningful changes detected');
      return { 
        ...generatedCampaign,
        _cdModifications: ['No changes made']
      };
    }

    console.log('✅ Modifications:', modifications);
    console.groupEnd();
    
    return { 
      ...result,
      _cdModifications: modifications 
    };

  } catch (err) {
    console.error('❌ CD Pass Failed:', err);
    console.groupEnd();
    return { 
      ...generatedCampaign,
      _cdModifications: [`Failed: ${(err as Error).message}`]
    };
  }
}

function getModifications(
  original: CampaignOutput, 
  modified: CampaignOutput
): string[] {
  const changes: string[] = [];

  // Campaign Name
  if (original.campaignName !== modified.campaignName) {
    changes.push(`Renamed: "${original.campaignName}" → "${modified.campaignName}"`);
  }

  // Execution Plan
  const newExecutions = modified.executionPlan.filter(
    item => !original.executionPlan.includes(item)
  );
  newExecutions.forEach(exec => changes.push(`Added: ${exec}`));

  // Creative Insights
  if (JSON.stringify(original.creativeInsights) !== 
     JSON.stringify(modified.creativeInsights)) {
    changes.push('Enhanced insights');
  }

  return changes;
}

// Type augmentation
declare module '../src/lib/campaign/types' {
  interface GeneratedCampaign {
    _cdModifications?: string[];
  }
}