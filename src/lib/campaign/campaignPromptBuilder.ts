import { CampaignInput } from './types';
import { Campaign } from '../campaignData';
import { formatCampaignForPrompt } from '@/utils/formatCampaignForPrompt';
import { getCreativePatternGuidance } from '@/utils/matchReferenceCampaigns';
import { getCreativeLensById } from '@/utils/creativeLenses';
import { CreativeDevice, formatCreativeDevicesForPrompt } from '@/data/creativeDevices';
import { CulturalTrend } from '@/data/culturalTrends';
import { PersonaType } from '@/types/persona';
import { MultiLayeredInsight } from './creativeInsightGenerator';

const BRAVERY_THRESHOLD = 6; // Minimum bravery requirement

function inferPersona(input: CampaignInput): PersonaType {
  const emotion = input.emotionalAppeal.map(e => e.toLowerCase()).join(' ');
  const objective = input.objectives.map(o => o.toLowerCase()).join(' ');
  const industry = input.industry.toLowerCase();

  if (industry.includes('tech') || industry.includes('ai')) return 'tech-innovator';
  if (emotion.includes('rebellion') || emotion.includes('urgency') || objective.includes('break rules')) return 'unfiltered-director';
  if (objective.includes('movement') || objective.includes('culture') || emotion.includes('belonging')) return 'culture-hacker';
  if (objective.includes('conversion') || objective.includes('data') || emotion.includes('trust')) return 'strategic-planner';

  return 'unfiltered-director';
}

function getPersonaInstructions(persona: PersonaType): string {
  const personaMap: Record<PersonaType, string> = {
    "unfiltered-director": `
### Strategist Persona: Unfiltered Creative Director
As an award-winning creative director, your job is not to play it safe.
- Avoid cliché tech gimmicks like "AI influencers" or "AR filters" unless used subversively.
- Start from real human behavior and surprising insights.
- Challenge the brief if it's boring — bend it to make something unforgettable.
- Channel emotion, tension, chaos, humor, rebellion — anything but mediocrity.
- If the idea could have been done in 2020, it's dead on arrival.
`,
    "strategic-planner": `
### Strategist Persona: Strategic Planner
As a meticulous strategic planner, your job is to create campaigns built on data-driven insights.
- Start with audience research and behavioral economics principles.
- Focus on measurable outcomes and clear customer journeys.
- Ensure every creative element serves a strategic purpose.
- Map out precise touchpoint strategies and conversion paths.
- Balance emotional appeal with rational drivers of behavior.
`,
    "culture-hacker": `
### Strategist Persona: Culture Hacker
As a culture hacker, your job is to turn brands into cultural phenomena.
- Identify emerging cultural tensions before they hit the mainstream.
- Subvert expectations and create genuine conversation.
- Leverage internet phenomena, creators, and community dynamics.
- Create ideas that feel more like movements than campaigns.
- Focus on participation over passive consumption.
`,
    "tech-innovator": `
### Strategist Persona: Tech Innovator
As a tech innovator, your job is to use emerging technologies to solve brand problems.
- Focus on real utility and meaningful applications, not gimmicks.
- Find ways to use technology to enhance human experiences.
- Consider how AI, AR, connected devices, or data visualization can be applied.
- Create memorable firsts that demonstrate technological leadership.
- Balance innovation with accessibility and practical implementation.
`
  };

  return personaMap[persona];
}

export const createCampaignPrompt = (
  input: CampaignInput,
  referenceCampaigns: Campaign[],
  creativeInsights: MultiLayeredInsight[] = [],
  creativeDevices: CreativeDevice[] = [],
  culturalTrends: CulturalTrend[] = []
): string => {
  const wildcardCampaigns: Campaign[] = [
    {
      id: '999-wild',
      name: 'The Breakaway',
      brand: 'Decathlon',
      year: 2021,
      industry: 'Retail',
      targetAudience: ['Sports fans', 'Cycling enthusiasts', 'Rehabilitation advocates'],
      objectives: ['Brand Reappraisal', 'Social Awareness'],
      keyMessage: 'A virtual cycling team made up of prisoners',
      strategy: 'Unexpected empathy storytelling in a virtual cycling context',
      features: [],
      emotionalAppeal: ['Empathy', 'Liberation'],
      outcomes: ['Global media buzz', 'Increased awareness for prison rehabilitation']
    },
    {
      id: '998-wild',
      name: 'Backup Ukraine',
      brand: 'UNESCO x Polycam',
      year: 2022,
      industry: 'Culture/Heritage',
      targetAudience: ['Cultural preservationists', 'Tech-savvy youth', 'Global citizens'],
      objectives: ['Cultural Protection', 'Tech-Driven Participation'],
      keyMessage: 'Digitally preserve endangered heritage sites in war zones',
      strategy: 'Crowdsourced digital preservation via AR',
      features: [],
      emotionalAppeal: ['Urgency', 'Cultural Protection'],
      outcomes: ['Millions of 3D scans submitted', 'International collaboration sparked']
    }
  ];

  const fullReferences = [...referenceCampaigns, ...wildcardCampaigns];
  const referenceCampaignsText = fullReferences.map(c => formatCampaignForPrompt(c)).join('\n');
  const braveReferences = fullReferences.filter(r => (r as any).braveryScore > BRAVERY_THRESHOLD);

  const insightsBlock = creativeInsights.length > 0 ? `
#### **Creative Insights**
These human truths should shape your concept:
${creativeInsights.map((insight, index) => {
    return `${index + 1}.
- Surface Insight: "${insight.surfaceInsight}"
- Emotional Undercurrent: "${insight.emotionalUndercurrent}"
- Creative Unlock: "${insight.creativeUnlock}"`;
  }).join('\n\n')}
Use at least one insight. Ground your story in emotion.` : '';

  const culturalTrendsBlock = culturalTrends.length > 0 ? `
#### ⚡ Cultural Trends (Optional Inspiration)
Below are recent cultural signals. Use them only if they add flavor, tension, or relevance to your idea. You can reference, subvert, or riff off them — but **only if they naturally support your insight or emotional angle**.

${culturalTrends.map((trend, index) => `${index + 1}. "${trend.title}": ${trend.description}`).join('\n')}
` : '';

  const referencePrompt = `
Use these real-world awarded campaigns for inspiration. Study their emotional appeal, cultural angle, and structure—but do not copy:
${referenceCampaignsText}
`;

  const braveryBlock = `
### Bravery Requirements
Your campaign must meet these standards:
- Score ≥${BRAVERY_THRESHOLD}/10 on the provocation scale
- Include at least one:
  * Physical world intervention
  * Institutional challenge
  * Culturally tense topic

Avoid:
- "AR experience" (overused)
- "TikTok challenge" (generic)
- "Pop-up event" (predictable)

Brave reference moves to emulate:
${braveReferences.map(r => `- ${r.name}: ${(r as any).keyMessage || 'N/A'}`).join('\n')}
`;

  const awardPatterns = getCreativePatternGuidance();
  const campaignStyle = input.campaignStyle || 'Any';
  const inferredPersona = inferPersona(input);
  const personaInstructions = getPersonaInstructions(inferredPersona);

  const creativeLens = input.creativeLens ? getCreativeLensById(input.creativeLens) : null;
  const creativeLensInstructions = creativeLens ? `
### Creative Lens: ${creativeLens.name}
${creativeLens.description}
Use this perspective to shape the campaign’s voice, concept, and cultural relevance.
` : '';

  const creativeDevicesBlock = formatCreativeDevicesForPrompt(creativeDevices);

  const provocationBlock = `
### Creative Provocation
Ask yourself:
- What would make Gen Z *stop scrolling*?
- What would brands be afraid to say — but should?
- What’s the unexpected twist, uncomfortable truth, or cultural spike?

Push for tension, contradiction, or irony. The idea should spark instant conversation.
`;

  const executionReminder = `
### Execution Rules of the Game
You must deliver exactly 4–5 execution ideas. Each one should be:
- Brave or unconventional
- Emotionally charged or culturally specific
- Unexpected in format, media, or tone
- Something a client might initially hesitate on — but jurors would reward

⚠️ Avoid: safe digital challenges, docuseries, AR/VR stunts, brand collabs, pop-ups, or influencer campaigns — unless they’re radically subverted.
Include at least one that reclaims public space, challenges norms, or invites vulnerability.
`;

  return `### Generate a groundbreaking marketing campaign with the following:

${personaInstructions}
${creativeLensInstructions}

#### Brand & Strategy
- Brand: ${input.brand}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience.join(', ')}
- Personality: ${input.brandPersonality || 'Flexible'}
- Differentiator: ${input.differentiator || 'N/A'}
- Market Trends: ${input.culturalInsights || 'N/A'}
- Emotional Appeal: ${input.emotionalAppeal.join(', ')}

${insightsBlock}
${culturalTrendsBlock}
${creativeDevicesBlock}
${provocationBlock}
${braveryBlock}
${executionReminder}

#### Campaign Format
- Objective: ${input.objectives.join(', ')}
- Style: ${campaignStyle}
- Constraints: ${input.additionalConstraints || 'None'}

#### Award-Winning Inspiration
${referencePrompt}

#### Pattern Library
${awardPatterns}

---

### Response Requirements (in JSON format):
\`\`\`json
{
  "campaignName": "Bold Campaign Name",
  "keyMessage": "Sharp, emotional one-liner",
  "creativeStrategy": ["Tactic 1", "Tactic 2", "Tactic 3"],
  "executionPlan": ["Execution 1", "Execution 2", "Execution 3", "Execution 4", "Execution 5"],
  "viralHook": "What makes it spread",
  "consumerInteraction": "How people participate",
  "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
  "viralElement": "One specific viral moment",
  "prHeadline": "Witty PR headline used in press releases and earned media",
  "callToAction": "Clear audience prompt",
  "creativeInsights": ["Used Insight 1", "Used Insight 2"]
}
\`\`\`

---

### Award Criteria Reminder
Judges at top festivals reward:
- Breakthrough originality, not safe or expected work
- Strong cultural relevance, tension, or subversion
- Emotional storytelling with staying power
- Clever execution, not just clever strategy

Your campaign should **challenge norms**, **ignite conversation**, and **feel inevitable in hindsight**. Don’t just meet the brief—**bend it into something iconic**.

Now respond with a culturally powerful campaign that could headline Cannes Lions 2025.`;
};
