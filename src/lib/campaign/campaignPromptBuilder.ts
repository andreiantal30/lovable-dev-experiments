import { CampaignInput } from './types';
import { Campaign } from '../campaignData';
import { formatCampaignForPrompt } from '@/utils/formatCampaignForPrompt';
import { getCreativePatternGuidance } from '@/utils/matchReferenceCampaigns';
import { getCreativeLensById } from '@/utils/creativeLenses';
import { CreativeDevice, formatCreativeDevicesForPrompt } from '@/data/creativeDevices';
import { CulturalTrend } from '@/data/culturalTrends';

/**
 * Build the prompt for campaign generation
 */
export const createCampaignPrompt = (
  input: CampaignInput, 
  referenceCampaigns: Campaign[],
  creativeInsights: string[] = [],
  creativeDevices: CreativeDevice[] = [],
  culturalTrends: CulturalTrend[] = []
): string => {
  const referenceCampaignsText = referenceCampaigns.map(campaign => formatCampaignForPrompt(campaign)).join('\n');

  const insightsBlock = creativeInsights.length > 0 ? `
#### **Creative Insights**
The following audience insights have been identified as key tensions or truths that can drive powerful creative:

${creativeInsights.map((insight, index) => `${index + 1}. "${insight}"`).join('\n')}

Use at least one of these insights as a foundation for your campaign strategy.` : '';

  const culturalTrendsBlock = culturalTrends.length > 0 ? `
#### **Cultural Trends**
The following cultural trends should be considered for your campaign:

${culturalTrends.map((trend, index) => `${index + 1}. "${trend.title}": ${trend.description}`).join('\n')}

Choose at most one if relevant. Avoid repeating or overfitting to AI/AR unless uniquely reimagined.` : '';

  const referencePrompt = `
Use the following real-world award-winning campaigns as inspiration. These examples align with the target audience, emotional appeal, or strategy you're being asked to create for. Do not copy them, but analyze what makes them powerful, then build something fresh.

${referenceCampaignsText}`;

  const awardPatterns = getCreativePatternGuidance();

  const styleDescriptions: Record<string, string> = {
    'digital': 'Digital-first approach with highly shareable, interactive content',
    'experiential': 'Experiential marketing focused on real-world brand immersion',
    'social': 'Social-led approach optimized for engagement and virality',
    'influencer': 'Influencer-driven marketing leveraging creators & personalities',
    'guerrilla': 'Unexpected, disruptive guerrilla marketing activation',
    'stunt': 'Attention-grabbing PR stunt designed to generate buzz',
    'UGC': 'User-generated content strategy encouraging consumer participation',
    'brand-activism': 'Brand Activism – Focused on social or environmental causes',
    'branded-entertainment': 'Branded Entertainment – Storytelling through content',
    'retail-activation': 'Retail Activation – In-store experiences, pop-ups, and interactive retail moments',
    'product-placement': 'Product Placement & Integration – Subtle advertising in media',
    'data-personalization': 'Data-Driven Personalization – Tailored messaging based on user data',
    'real-time': 'Real-Time & Reactive Marketing – Capitalizing on trending topics',
    'event-based': 'Event-Based – Tied to concerts, sports, cultural events, etc.',
    'ooh-ambient': 'OOH & Ambient – Billboards, murals, and unexpected placements',
    'ai-generated': 'AI-Generated – Campaign created or enhanced by AI tools',
    'co-creation': 'Co-Creation & Collabs – Brand partnerships with artists, designers, or other brands',
    'stunt-marketing': 'Stunt Marketing – One-time, bold activations to grab attention',
    'ar-vr': 'AR/VR-Driven – Interactive digital experiences using augmented or virtual reality',
    'performance': 'Performance-Driven – Focused on measurable conversions & ROI',
    'loyalty-community': 'Loyalty & Community-Building – Built around exclusivity and brand affinity'
  };

  let campaignStyleDescription = input.campaignStyle && styleDescriptions[input.campaignStyle] 
    ? styleDescriptions[input.campaignStyle] 
    : 'Flexible or hybrid format depending on brand objective';

  const personaInstructionsMap: Record<string, string> = {
    'bold-risk-taker': `
### Strategist Persona: Bold Risk-Taker
As a Bold Risk-Taker, create a campaign that:
- Challenges conventions and pushes boundaries
- Uses provocative messaging that starts conversations
- Takes creative risks that other brands wouldn’t attempt`,

    'safe-brand-builder': `
### Strategist Persona: Safe Brand Builder
As a Safe Brand Builder, create a campaign that:
- Uses proven strategies with reliable outcomes
- Focuses on long-term brand equity over short-term attention`,

    'viral-trend-expert': `
### Strategist Persona: Viral Trend Expert
As a Viral Trend Expert, create a campaign that:
- Leverages current cultural trends and conversations
- Contains clear viral triggers that encourage spreading`,

    'storytelling-artist': `
### Strategist Persona: Storytelling Artist
As a Storytelling Artist, create a campaign that:
- Centers around a compelling narrative arc
- Creates emotional resonance and human connection`,

    'data-driven-strategist': `
### Strategist Persona: Data-Driven Strategist
As a Data-Driven Strategist, create a campaign that:
- Incorporates clear performance metrics
- Balances creativity with measurable outcomes`
  };

  const personaInstructions = input.persona ? personaInstructionsMap[input.persona] || '' : '';

  const lens = input.creativeLens && getCreativeLensById(input.creativeLens);
  const creativeLensInstructions = lens ? `
### **Creative Lens: ${lens.name}**
${lens.description} - ${lens.promptGuidance}` : '';

  const creativeDevicesBlock = formatCreativeDevicesForPrompt(creativeDevices);

  const whatNotToDo = `
### Avoid These Pitfalls
- Avoid clichés like "AI influencer" or "AR filter" unless they are justified by insight.
- Do not repeat previous campaign structures without a bold twist.
- Don’t rely on platform trends unless deeply tied to brand narrative.`;

  return `### Generate a culture-defining creative campaign:

${personaInstructions}
${creativeLensInstructions}

#### **Brand & Strategic Positioning**
- **Brand Name:** ${input.brand}
- **Industry:** ${input.industry}
- **Target Audience:** ${input.targetAudience.join(', ')}
- **Emotional Appeal:** ${input.emotionalAppeal.join(', ')}
- **Differentiator:** ${input.differentiator || 'None'}
- **Brand Personality:** ${input.brandPersonality || 'N/A'}
- **Cultural Insight:** ${input.culturalInsights || 'N/A'}

${insightsBlock}
${culturalTrendsBlock}
${creativeDevicesBlock}
${whatNotToDo}

#### **Campaign Style**: ${campaignStyleDescription}
#### **Primary Objective**: ${input.objectives.join(', ')}

${referencePrompt}

#### **Award Patterns**
${awardPatterns}

#### **Output Format (JSON)**
Return ONLY valid JSON in this structure:
\`\`\`json
{
  "campaignName": "Name here",
  "keyMessage": "Message",
  "creativeStrategy": ["..."],
  "executionPlan": ["..."],
  "viralHook": "...",
  "consumerInteraction": "...",
  "expectedOutcomes": ["..."],
  "viralElement": "...",
  "callToAction": "...",
  "creativeInsights": ["..."]
}
\`\`\`

---
Your goal: Think like an award-winning creative team, blending relevance, surprise, and cultural power. 🚀`;
};
