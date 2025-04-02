import { CampaignInput } from './types';
import { Campaign } from '../campaignData';
import { formatCampaignForPrompt } from '@/utils/formatCampaignForPrompt';
import { getCreativePatternGuidance } from '@/utils/matchReferenceCampaigns';
import { getCreativeLensById } from '@/utils/creativeLenses';
import { CreativeDevice, formatCreativeDevicesForPrompt } from '@/data/creativeDevices';
import { CulturalTrend } from '@/data/culturalTrends';
import { PersonaType } from '@/types/persona';

function getPersonaInstructions(persona: PersonaType): string {
  const personaMap: Record<string, string> = {
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

  return personaMap[persona] || personaMap["unfiltered-director"];
}

export const createCampaignPrompt = (
  input: CampaignInput,
  referenceCampaigns: Campaign[],
  creativeInsights: string[] = [],
  creativeDevices: CreativeDevice[] = [],
  culturalTrends: CulturalTrend[] = []
): string => {
  const awardHeadlinePatterns = `
### Award-Winning Headline Patterns to Inspire Naming
- “The [Unexpected Mechanism] That [Human Outcome]”  
- “We Didn’t [Do X], We [Did Y Instead]”  
- “Turning [Problem] Into [Cultural Power]”  
- “When [Group] Meets [World/Context]”  
- “The Campaign That [Media Reaction]”  
Use these to name the campaign or spark a unique structure.
`;

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

  const insightsBlock = creativeInsights.length > 0 ? `
#### **Creative Insights**
These human truths should shape your concept:
${creativeInsights.map((insight, index) => `${index + 1}. "${insight}"`).join('\n')}
Use at least one insight. Ground your story in emotion.` : '';

  const culturalTrendsBlock = culturalTrends.length > 0 ? `
#### **Cultural Trends (Use for Flavor Only)**
These are not campaign themes. Do NOT use them as the core idea.
They're just cultural backdrops—like set design for your story.
${culturalTrends.slice(0, 3).map((trend, index) => `${index + 1}. "${trend.title}": ${trend.description}`).join('\n')}` : '';

  const referencePrompt = `
Use these real-world awarded campaigns for inspiration. Study their emotional appeal, cultural angle, and structure—but do not copy:
${referenceCampaignsText}
`;

  const awardPatterns = getCreativePatternGuidance();

  const campaignStyleDescription = input.campaignStyle || 'Any';
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

  const campaignStyle = styleDescriptions[input.campaignStyle || ''] || campaignStyleDescription;
  const personaInstructions = getPersonaInstructions(input.persona || "unfiltered-director" as PersonaType);
  const creativeLens = input.creativeLens ? getCreativeLensById(input.creativeLens) : null;
  const creativeLensInstructions = creativeLens ? `
### Creative Lens: ${creativeLens.name}
${creativeLens.description}
Use this perspective to shape the campaign’s voice, concept, and cultural relevance.
` : '';

  // ... [unchanged imports and helper functions remain above]

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
### Execution Spike Reminder
Your execution plan must include at least one:
- Brave or controversial move
- Genre-defying medium
- Wild cultural twist
- Bold channel hack
- Unexpected tension or friction point

This is what earns metal at Cannes. At least one execution must punch above the brief.
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
${awardHeadlinePatterns}
${provocationBlock}
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