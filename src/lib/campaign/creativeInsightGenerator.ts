import { CampaignInput } from './types';
import { generateWithOpenAI, OpenAIConfig } from '../openai';
import { extractJsonFromResponse } from './utils';

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
  systemicHypocrisy: string;
  actionParadox: string;
  irony?: string; // NEW: Added field
  brandComplicity?: string; // NEW: Added field
}

// 🔍 Enhanced scoring with irony and complicity weighting
const scoreInsight = (insight: MultiLayeredInsight): number => {
  let score = 0;

  // Tier 1: Core tension (max 6pts)
  if (/but|however|yet|although|paradox/i.test(insight.surfaceInsight)) score += 3;
  if (insight.systemicHypocrisy) score += 2;
  if (insight.irony) score += 1; // NEW: Irony bonus

  // Tier 2: Cultural relevance (max 4pts)
  const culturalMarkers = [
    /gen [a-z]|post-pandemic|climate [a-z]|digital [a-z]/i,
    /algorithm|AI|automation/i,
    /late capitalism|precarity|burnout/i
  ];
  culturalMarkers.forEach(regex => {
    if (regex.test(insight.surfaceInsight + insight.emotionalUndercurrent)) score += 2;
  });

  // Tier 3: Emotional depth (max 8pts)
  const emotionalMarkers = {
    guilt: 2, shame: 2, fear: 1, longing: 1, resentment: 3
  };
  Object.entries(emotionalMarkers).forEach(([term, points]) => {
    if (new RegExp(term, 'i').test(insight.emotionalUndercurrent)) score += points;
  });

  // Tier 4: Strategic depth (max 6pts)
  if (insight.actionParadox) score += 3;
  if (insight.brandComplicity) score += 3; // NEW: Complicity bonus

  return Math.min(score, 12); // NEW: Increased cap to 12
};

export async function generateCreativeInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<MultiLayeredInsight[]> {
  try {
    const prompt = `
### Cultural Tension Mapper – Radical Insight Builder (v3)

You're a strategist at ${input.brand}'s most dangerous agency. Expose:

1. **VISIBLE CONTRADICTION** (surfaceInsight):
   "They publicly ___, but secretly ___"

2. **EMOTIONAL WARZONE** (emotionalUndercurrent):
   Use visceral language: "A deep fear of ___ mixed with ___"

3. **SYSTEMIC LIE** (systemicHypocrisy):
   "${input.industry} claims ___, but actually ___"

4. **IRONIC TRAP** (irony): // NEW SECTION
   "The more they ___, the less they ___"

5. **BRAND COMPLICITY** (brandComplicity): // NEW SECTION
   "${input.brand} profits from ___ while claiming ___"

6. **ACTION PARADOX** (actionParadox):
   "To achieve ___, they must first ___"

7. **CREATIVE DETONATOR** (creativeUnlock):
   "We'll help them ___ by weaponizing ___"

Return JSON with ALL fields:
{
  "surfaceInsight": "...",
  "emotionalUndercurrent": "...",
  "systemicHypocrisy": "...",
  "irony": "...", // NEW
  "brandComplicity": "...", // NEW
  "actionParadox": "...",
  "creativeUnlock": "..."
}

--- CONTEXT ---
Brand: ${input.brand} (${input.industry})
Audience: ${input.targetAudience.join(', ')}
Desired Emotions: ${input.emotionalAppeal.join(', ')}
Current Year: ${new Date().getFullYear()}
`;

    const response = await generateWithOpenAI(prompt, config);
    const parsed = JSON.parse(extractJsonFromResponse(response));

    // Validate all required fields including new ones
    const requiredFields = [
      'surfaceInsight', 'emotionalUndercurrent', 'systemicHypocrisy',
      'irony', 'brandComplicity', 'actionParadox', 'creativeUnlock'
    ];

    if (!requiredFields.every(field => parsed[field]?.trim())) {
      throw new Error(`Missing required field in: ${JSON.stringify(parsed)}`);
    }

    return [parsed];

  } catch (error) {
    console.error("⚠️ Insight generation failed:", error);
    return [getFallbackInsight(input)];
  }
}

// 🔥 Enhanced contradiction generator with irony injection
export async function generatePenetratingInsights(
  input: CampaignInput,
  config: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<MultiLayeredInsight[]> {
  try {
    const [base] = await generateCreativeInsights(input, config);

    const contradictionPrompt = `
Take this core insight:
"${base.surfaceInsight}"

Generate 3 DEEPER variations that:
1. Make the irony more painful: "The harder they ___, the worse ___ gets"
2. Expose darker brand complicity: "${input.brand} secretly benefits from ___"
3. Flip the paradox: "They must ___ to stop ___"

Each must include:
- More dangerous systemic hypocrisy
- Sharper emotional conflict
- More radical creative unlock

Return JSON array with ALL original fields plus:
{
  "irony": "New ironic twist",
  "brandComplicity": "Darker brand truth"
}

Example format:
[{
  "surfaceInsight": "...",
  "emotionalUndercurrent": "...",
  ...
}]`;

    const response = await generateWithOpenAI(contradictionPrompt, config);
    const contradictions = JSON.parse(extractJsonFromResponse(response));

    return [base, ...contradictions]
      .sort((a, b) => scoreInsight(b) - scoreInsight(a))
      .slice(0, 3);

  } catch (error) {
    console.error("⚠️ Contradiction generation failed:", error);
    return [getFallbackInsight(input)];
  }
}

// NEW: Enhanced fallback with all required fields
function getFallbackInsight(input: CampaignInput): MultiLayeredInsight {
  return {
    surfaceInsight: "Gen Z demands change but algorithms reward conformity",
    emotionalUndercurrent: "A simmering rage at having to perform wokeness",
    systemicHypocrisy: "Platforms profit from dissent they systematically suppress",
    irony: "The more they fight the system, the more content they create for it",
    brandComplicity: `${input.brand} sells rebellion while being owned by private equity`,
    actionParadox: "Must use corporate tools to dismantle corporate power",
    creativeUnlock: "Help them sabotage the machine from within using its own rules"
  };
}