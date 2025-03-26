import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig, evaluateCampaign } from './openai';
import { generateStorytellingNarrative, StorytellingOutput } from './storytellingGenerator';
import { findSimilarCampaignsWithEmbeddings } from './embeddingsUtil';
import { toast } from "sonner";
import { PersonaType } from '@/types/persona';
import { matchReferenceCampaigns, getCreativePatternGuidance } from '@/utils/matchReferenceCampaigns';
import { formatCampaignForPrompt } from '@/utils/formatCampaignForPrompt';
import { campaigns } from '@/data/campaigns';
import { CreativeLens, getCreativeLensById } from '@/utils/creativeLenses';

export interface CampaignInput {
  brand: string;
  industry: string;
  targetAudience: string[];
  objectives: string[];
  emotionalAppeal: string[];
  additionalConstraints?: string;
  brandPersonality?: string;
  differentiator?: string;
  culturalInsights?: string;
  campaignStyle?: 
    | "digital" 
    | "experiential" 
    | "social" 
    | "influencer" 
    | "guerrilla" 
    | "ugc" 
    | "brand-activism" 
    | "branded-entertainment" 
    | "retail-activation" 
    | "product-placement" 
    | "data-personalization" 
    | "real-time" 
    | "event-based" 
    | "ooh-ambient" 
    | "ai-generated" 
    | "co-creation" 
    | "stunt-marketing" 
    | "ar-vr" 
    | "performance" 
    | "loyalty-community"
    | "stunt"
    | "UGC";
  persona?: PersonaType;
  creativeLens?: CreativeLens;
}

export interface GeneratedCampaign {
  campaignName: string;
  keyMessage: string;
  creativeStrategy: string[];
  executionPlan: string[];
  expectedOutcomes: string[];
  viralHook?: string;
  consumerInteraction?: string;
  referenceCampaigns: Campaign[];
  storytelling?: StorytellingOutput;
  viralElement?: string;
  callToAction?: string;
  emotionalAppeal?: string[];
  evaluation?: string;
  creativeInsights?: string[];
}

async function generateCreativeInsights(
  input: CampaignInput,
  config: OpenAIConfig = defaultOpenAIConfig
): Promise<string[]> {
  try {
    const currentYear = new Date().getFullYear();
    const audienceString = input.targetAudience.join(', ');
    const objectivesString = input.objectives.join(', ');
    
    const prompt = `
### Creative Insight Builder

Generate 3 powerful insights about the target audience that will unlock creative potential for this campaign. 
These should be tensions, truths, or emotional realities that the target audience experiences in ${currentYear}.

**Target Audience:** ${audienceString}
**Brand:** ${input.brand}
**Industry:** ${input.industry}
**Campaign Objectives:** ${objectivesString}
**Emotional Appeal to Tap Into:** ${input.emotionalAppeal.join(', ')}

For each insight:
1. Focus on a specific tension or truth that the audience feels
2. Make it specific, not generic
3. Connect it to the brand's ability to solve or provoke this tension
4. Phrase it as a simple, powerful statement that could inspire creative work

Format your response as a JSON array of exactly 3 insights:
\`\`\`json
["Insight statement 1", "Insight statement 2", "Insight statement 3"]
\`\`\`

The best insights will reveal something that feels true but hasn't been overly exploited in marketing.
`;

    const response = await generateWithOpenAI(prompt, config);
    const cleanedResponse = extractJsonFromResponse(response);
    
    try {
      const insights = JSON.parse(cleanedResponse);
      if (Array.isArray(insights) && insights.length > 0) {
        return insights.slice(0, 3);
      }
    } catch (error) {
      console.error("Error parsing creative insights:", error);
    }
    
    return ["The audience seeks authentic connections in an increasingly digital world.",
            "They value brands that understand their specific needs rather than generic solutions.",
            "They want to feel seen and validated through their brand choices."];
  } catch (error) {
    console.error("Error generating creative insights:", error);
    return [];
  }
}

interface EnhancedSimilarityScore {
  campaign: Campaign;
  totalScore: number;
  dimensionScores: {
    industry: number;
    audience: number;
    objectives: number;
    emotion: number;
    style: number;
    sentiment: number;
    tone: number;
  };
}

type SentimentCategory = 'positive' | 'neutral' | 'negative';
type ToneCategory = 'formal' | 'casual' | 'humorous' | 'serious' | 'inspirational';

function determineSentiment(emotionalAppeal: string[]): SentimentCategory {
  const positiveEmotions = ['joy', 'happiness', 'excitement', 'love', 'pride', 'hope', 'inspiration', 'happiness', 'optimism'];
  const negativeEmotions = ['fear', 'anger', 'sadness', 'guilt', 'shame', 'disgust', 'anxiety', 'frustration', 'disappointment'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  emotionalAppeal.forEach(emotion => {
    const lowerEmotion = emotion.toLowerCase();
    if (positiveEmotions.some(e => lowerEmotion.includes(e))) {
      positiveCount++;
    }
    if (negativeEmotions.some(e => lowerEmotion.includes(e))) {
      negativeCount++;
    }
  });
  
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  }
  return 'neutral';
}

function determineTone(objectives: string[], emotionalAppeal: string[]): ToneCategory {
  const formalKeywords = ['professional', 'authority', 'expertise', 'corporate', 'prestige', 'luxury'];
  const casualKeywords = ['friendly', 'approachable', 'conversational', 'relatable', 'everyday'];
  const humorousKeywords = ['funny', 'humor', 'wit', 'playful', 'quirky', 'entertainment'];
  const seriousKeywords = ['important', 'critical', 'urgent', 'meaningful', 'impactful', 'awareness'];
  const inspirationalKeywords = ['inspire', 'motivation', 'aspiration', 'empowerment', 'dreams', 'future'];
  
  const allText = [...objectives, ...emotionalAppeal].join(' ').toLowerCase();
  
  const counts = {
    formal: formalKeywords.filter(word => allText.includes(word)).length,
    casual: casualKeywords.filter(word => allText.includes(word)).length,
    humorous: humorousKeywords.filter(word => allText.includes(word)).length,
    serious: seriousKeywords.filter(word => allText.includes(word)).length,
    inspirational: inspirationalKeywords.filter(word => allText.includes(word)).length
  };
  
  let maxCount = 0;
  let dominantTone: ToneCategory = 'formal';
  
  for (const [tone, count] of Object.entries(counts) as [ToneCategory, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominantTone = tone;
    }
  }
  
  return dominantTone;
}

const findSimilarCampaigns = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<Campaign[]> => {
  try {
    console.log('Using new reference campaign matcher');
    const matchedCampaigns = matchReferenceCampaigns(input);
    
    if (matchedCampaigns && matchedCampaigns.length > 0) {
      console.log('Found matches using new reference campaign matcher:', 
        matchedCampaigns.map(c => c.name));
      return matchedCampaigns;
    }
  } catch (error) {
    console.error('Error with new reference campaign matcher:', error);
  }
  
  if (openAIConfig.apiKey) {
    try {
      const embeddingResults = await findSimilarCampaignsWithEmbeddings(
        input, 
        campaigns,
        openAIConfig
      );
      
      if (embeddingResults && embeddingResults.length > 0) {
        console.log('Using embedding-based campaign matches');
        return embeddingResults;
      }
    } catch (error) {
      console.error('Error with embedding-based matching:', error);
    }
  }
  
  console.log('Using traditional campaign matching');
  
  const inputSentiment = determineSentiment(input.emotionalAppeal);
  const inputTone = determineTone(input.objectives, input.emotionalAppeal);
  
  const scoredCampaigns: EnhancedSimilarityScore[] = campaigns.map(campaign => {
    const dimensionScores = {
      industry: 0,
      audience: 0,
      objectives: 0,
      emotion: 0,
      style: 0,
      sentiment: 0,
      tone: 0
    };
    
    if (campaign.industry.toLowerCase() === input.industry.toLowerCase()) {
      dimensionScores.industry = 5;
    } else if (campaign.industry.toLowerCase().includes(input.industry.toLowerCase()) || 
              input.industry.toLowerCase().includes(campaign.industry.toLowerCase())) {
      dimensionScores.industry = 3;
    }
    
    let audienceMatchCount = 0;
    input.targetAudience.forEach(audience => {
      if (campaign.targetAudience.some(a => 
        a.toLowerCase().includes(audience.toLowerCase()) || 
        audience.toLowerCase().includes(a.toLowerCase())
      )) {
        audienceMatchCount++;
      }
    });
    dimensionScores.audience = Math.min(audienceMatchCount * 5, 15);
    
    let objectivesMatchCount = 0;
    input.objectives.forEach(objective => {
      if (campaign.objectives.some(o => 
        o.toLowerCase().includes(objective.toLowerCase()) || 
        objective.toLowerCase().includes(o.toLowerCase())
      )) {
        objectivesMatchCount++;
      }
    });
    dimensionScores.objectives = Math.min(objectivesMatchCount * 5, 15);
    
    let emotionMatchCount = 0;
    input.emotionalAppeal.forEach(emotion => {
      if (campaign.emotionalAppeal.some(e => 
        e.toLowerCase().includes(emotion.toLowerCase()) || 
        emotion.toLowerCase().includes(e.toLowerCase())
      )) {
        emotionMatchCount++;
      }
    });
    dimensionScores.emotion = Math.min(emotionMatchCount * 5, 15);
    
    if (input.campaignStyle) {
      const campaignText = (campaign.strategy + ' ' + campaign.keyMessage).toLowerCase();
      
      const styleKeywords: Record<string, string[]> = {
        'digital': ['digital', 'online', 'website', 'app', 'mobile'],
        'experiential': ['experience', 'event', 'activation', 'immersive', 'interactive'],
        'social': ['social media', 'social network', 'community', 'user generated'],
        'influencer': ['influencer', 'creator', 'personality', 'ambassador', 'celebrity'],
        'guerrilla': ['guerrilla', 'unconventional', 'unexpected', 'surprise', 'street'],
        'stunt': ['stunt', 'bold', 'attention-grabbing', 'publicity', 'shocking'],
        'UGC': ['user generated', 'ugc', 'community content', 'fan content'],
        'brand-activism': ['activism', 'cause', 'social change', 'environmental', 'purpose'],
        'branded-entertainment': ['entertainment', 'content', 'film', 'series', 'show'],
        'retail-activation': ['retail', 'store', 'shop', 'pop-up', 'in-store'],
        'product-placement': ['placement', 'integration', 'media', 'film', 'show'],
        'data-personalization': ['data', 'personalization', 'personalized', 'tailored', 'custom'],
        'real-time': ['real-time', 'trending', 'reactive', 'newsjacking', 'moment'],
        'event-based': ['event', 'concert', 'sports', 'festival', 'cultural'],
        'ooh-ambient': ['ooh', 'outdoor', 'billboard', 'ambient', 'street'],
        'ai-generated': ['ai', 'artificial intelligence', 'machine learning', 'generated'],
        'co-creation': ['collaboration', 'partnership', 'collab', 'co-create', 'artists'],
        'stunt-marketing': ['stunt', 'bold', 'attention-grabbing', 'publicity', 'shocking'],
        'ar-vr': ['ar', 'vr', 'augmented reality', 'virtual reality', 'mixed reality'],
        'performance': ['performance', 'conversion', 'roi', 'results', 'metrics'],
        'loyalty-community': ['loyalty', 'community', 'membership', 'exclusive', 'belonging']
      };
      
      const relevantKeywords = styleKeywords[input.campaignStyle] || [];
      const matchCount = relevantKeywords.filter(keyword => campaignText.includes(keyword)).length;
      
      if (matchCount > 0) {
        dimensionScores.style = Math.min(matchCount * 2.5, 10);
      }
    }
    
    const campaignSentiment = determineSentiment(campaign.emotionalAppeal);
    if (inputSentiment === campaignSentiment) {
      dimensionScores.sentiment = 10;
    } else if (
      (inputSentiment === 'neutral' && campaignSentiment !== 'neutral') || 
      (campaignSentiment === 'neutral' && inputSentiment !== 'neutral')
    ) {
      dimensionScores.sentiment = 5;
    }
    
    const campaignTone = determineTone(campaign.objectives, campaign.emotionalAppeal);
    if (inputTone === campaignTone) {
      dimensionScores.tone = 10;
    } else {
      const toneCompatibility: Record<ToneCategory, Record<ToneCategory, number>> = {
        'formal': { 'casual': 3, 'humorous': 1, 'serious': 7, 'inspirational': 5, 'formal': 10 },
        'casual': { 'formal': 3, 'humorous': 7, 'serious': 3, 'inspirational': 5, 'casual': 10 },
        'humorous': { 'formal': 1, 'casual': 7, 'serious': 1, 'inspirational': 3, 'humorous': 10 },
        'serious': { 'formal': 7, 'casual': 3, 'humorous': 1, 'inspirational': 5, 'serious': 10 },
        'inspirational': { 'formal': 5, 'casual': 5, 'humorous': 3, 'serious': 5, 'inspirational': 10 }
      };
      
      dimensionScores.tone = toneCompatibility[inputTone][campaignTone];
    }
    
    const totalScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0);
    
    return {
      campaign,
      totalScore,
      dimensionScores
    };
  });
  
  const topScoring = scoredCampaigns
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
  
  const selected: EnhancedSimilarityScore[] = [];
  
  selected.push(topScoring[0]);
  
  while (selected.length < 3 && selected.length < topScoring.length) {
    const avgDimensionScores: Record<string, number> = {};
    Object.keys(topScoring[0].dimensionScores).forEach(dimension => {
      avgDimensionScores[dimension] = selected.reduce(
        (sum, item) => sum + item.dimensionScores[dimension as keyof typeof item.dimensionScores], 
        0
      ) / selected.length;
    });
    
    let bestComplement: EnhancedSimilarityScore | null = null;
    let bestComplementScore = -1;
    
    for (const candidate of topScoring) {
      if (selected.some(s => s.campaign.id === candidate.campaign.id)) {
        continue;
      }
      
      let complementScore = 0;
      Object.entries(avgDimensionScores).forEach(([dimension, avgScore]) => {
        const dimensionKey = dimension as keyof typeof candidate.dimensionScores;
        if (avgScore < 7 && candidate.dimensionScores[dimensionKey] > avgScore) {
          complementScore += (candidate.dimensionScores[dimensionKey] - avgScore);
        }
      });
      
      if (complementScore > bestComplementScore) {
        bestComplementScore = complementScore;
        bestComplement = candidate;
      }
    }
    
    if (bestComplement) {
      selected.push(bestComplement);
    } else {
      const nextBest = topScoring.find(
        candidate => !selected.some(s => s.campaign.id === candidate.campaign.id)
      );
      if (nextBest) {
        selected.push(nextBest);
      }
    }
  }
  
  console.log('Traditional campaign selection:', selected.map(s => ({
    name: s.campaign.name,
    score: s.totalScore,
    dimensions: s.dimensionScores
  })));
  
  return selected.map(s => s.campaign);
};

const createCampaignPrompt = (
  input: CampaignInput, 
  referenceCampaigns: Campaign[],
  creativeInsights: string[] = []
): string => {
  const referenceCampaignsText = referenceCampaigns.map(campaign => formatCampaignForPrompt(campaign)).join('\n');

  const insightsBlock = creativeInsights.length > 0 ? `
#### **Creative Insights**
The following audience insights have been identified as key tensions or truths that can drive powerful creative:

${creativeInsights.map((insight, index) => `${index + 1}. "${insight}"`).join('\n')}

Use at least one of these insights as a foundation for your campaign strategy.
` : '';

  const referencePrompt = `
Use the following real-world award-winning campaigns as inspiration. These examples align with the target audience, emotional appeal, or strategy you're being asked to create for. Do not copy them, but analyze what makes them powerful, then build something fresh.

${referenceCampaignsText}
`;

  console.log("Reference Prompt Block:");
  console.log(referencePrompt);
  console.log("Reference Campaigns Count:", referenceCampaigns.length);
  
  const awardPatterns = getCreativePatternGuidance();
  
  let campaignStyleDescription = input.campaignStyle || 'Any';
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
  
  if (input.campaignStyle && styleDescriptions[input.campaignStyle]) {
    campaignStyleDescription = styleDescriptions[input.campaignStyle];
  }

  let personaInstructions = '';
  if (input.persona) {
    switch (input.persona) {
      case 'bold-risk-taker':
        personaInstructions = `
### Strategist Persona: Bold Risk-Taker
As a Bold Risk-Taker, create a campaign that:
- Challenges conventions and pushes boundaries
- Contains unexpected elements that surprise the audience
- Uses provocative messaging that starts conversations
- Takes creative risks that other brands wouldn't attempt
- Focuses on standing out rather than fitting in`;
        break;
      case 'safe-brand-builder':
        personaInstructions = `
### Strategist Persona: Safe Brand Builder
As a Safe Brand Builder, create a campaign that:
- Prioritizes brand consistency and reputation
- Uses proven strategies with reliable outcomes
- Maintains brand integrity while still being creative
- Focuses on long-term brand equity over short-term attention
- Creates a sense of trust and reliability`;
        break;
      case 'viral-trend-expert':
        personaInstructions = `
### Strategist Persona: Viral Trend Expert
As a Viral Trend Expert, create a campaign that:
- Leverages current cultural trends and conversations
- Incorporates highly shareable elements and challenges
- Is optimized for specific platform mechanics and algorithms
- Contains clear viral triggers that encourage spreading
- Feels timely and connected to the current moment`;
        break;
      case 'storytelling-artist':
        personaInstructions = `
### Strategist Persona: Storytelling Artist
As a Storytelling Artist, create a campaign that:
- Centers around a compelling narrative arc
- Develops relatable characters or situations
- Creates emotional resonance and connection
- Takes audiences on a meaningful journey
- Values authenticity and human connection`;
        break;
      case 'data-driven-strategist':
        personaInstructions = `
### Strategist Persona: Data-Driven Strategist
As a Data-Driven Strategist, create a campaign that:
- Is precisely targeted to specific audience segments
- Incorporates clear performance metrics and benchmarks
- Includes elements that can be A/B tested and optimized
- Focuses on conversion paths and customer journey
- Balances creativity with measurable outcomes`;
        break;
    }
  }

  let creativeLensInstructions = '';
  if (input.creativeLens) {
    const lens = getCreativeLensById(input.creativeLens);
    if (lens) {
      creativeLensInstructions = `
### **Creative Lens: ${lens.name}**
**Choose this creative lens and apply it to this brief before writing the idea.**

${lens.description} - ${lens.promptGuidance}

When creating this campaign, ensure that you incorporate this creative perspective throughout your thinking.
`;
    }
  }

  return `### Generate a groundbreaking marketing campaign with the following key elements:

${personaInstructions}

${creativeLensInstructions}

#### **Brand & Strategic Positioning**
- **Brand Name:** ${input.brand}
- **Industry:** ${input.industry}
- **Target Audience:** ${input.targetAudience.join(', ')}
- **Brand Personality:** ${input.brandPersonality || 'Flexible – Adapt to campaign needs'}
- **Competitive Differentiator:** ${input.differentiator || 'N/A'}
- **Current Market Trends / Cultural Insights to Consider:** ${input.culturalInsights || 'N/A'}
- **Emotional Appeal to Tap Into:** ${input.emotionalAppeal.join(', ')}

${insightsBlock}

#### **Campaign Details**
- **Primary Objective:** ${input.objectives.join(', ')}
- **Campaign Style:** ${campaignStyleDescription}
- **Additional Constraints:** ${input.additionalConstraints || 'None'}

#### **Strategic Reference Campaign Injection**

Purpose: Match award-winning examples to your request.

${referencePrompt}

Draw strategic parallels, learn from their emotional appeals, and innovate beyond their tactics.

#### **Award-Winning Pattern Library**

${awardPatterns}

If relevant, use one or more of these patterns when shaping the campaign strategy or execution.

---

#### **Campaign Output Requirements:**
Please generate a campaign concept that includes:
1. **A campaign name that is bold, memorable, and culturally relevant**  
2. **A key message that is both simple and emotionally powerful**  
3. **Three creative strategies that push boundaries and bring fresh energy**  
4. **Five executional elements that maximize reach, engagement, and participation**  
5. **A cultural hook or viral trigger** (e.g., meme, challenge, unexpected collab, internet trend)  
6. **A unique brand-consumer interaction mechanic** (e.g., gamification, user participation, real-world touchpoint)  
7. **Four expected outcomes or success metrics**  
8. **A viral element** (e.g., a specific viral trigger or campaign element that will drive engagement)
9. **A call to action** (e.g., a clear call to action for the audience to take)

---

### **Response Format:**  
Provide your response in **JSON format** with the following structure:

\`\`\`json
{
  "campaignName": "Innovative Campaign Name",
  "keyMessage": "Short, impactful key message",
  "creativeStrategy": ["Creative strategy 1", "Creative strategy 2", "Creative strategy 3"],
  "executionPlan": ["Execution item 1", "Execution item 2", "Execution item 3", "Execution item 4", "Execution item 5"],
  "viralHook": "How the campaign becomes culturally relevant and shareable",
  "consumerInteraction": "How the audience actively participates",
  "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"],
  "viralElement": "Viral element description",
  "callToAction": "Call to action description",
  "creativeInsights": ["Creative insight used 1", "Creative insight used 2", "Creative insight used 3"]
}
\`\`\`

---

### **Guidelines:**
- **Make it groundbreaking:** Think beyond traditional ads—consider experiential, tech-driven, or culture-hacking approaches.  
- **Make it insightful:** Tie the campaign to a real-world trend, behavior, or cultural moment.  
- **Make it entertaining:** Infuse humor, surprise, or an emotional twist to make the campaign unforgettable.  
- **Leverage the creative insights:** Use at least one of the provided audience insights to create a more relevant and impactful campaign.

---

**Objective:** Generate a campaign that feels like an award-winning, culture-defining moment rather than just another ad. 🚀  
`;
};

const extractJsonFromResponse = (text: string): string => {
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return text.trim();
};

export const generateCampaign = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    const creativeInsights = await generateCreativeInsights(input, openAIConfig);
    console.log("Generated Creative Insights:", creativeInsights);
    
    const referenceCampaigns = await findSimilarCampaigns(input, openAIConfig);
    
    console.log("Matched Reference Campaigns:", 
      referenceCampaigns.map(c => ({
        name: c.name,
        brand: c.brand,
        industry: c.industry
      }))
    );
    
    const prompt = createCampaignPrompt(input, referenceCampaigns, creativeInsights);
    
    console.log("Prompt Preview (first 200 chars):", prompt.substring(0, 200));
    
    const response = await generateWithOpenAI(prompt, openAIConfig);
    
    const cleanedResponse = extractJsonFromResponse(response);
    
    const generatedContent = JSON.parse(cleanedResponse);
    
    const campaign: GeneratedCampaign = {
      ...generatedContent,
      referenceCampaigns,
      creativeInsights
    };
    
    try {
      const storytellingInput = {
        brand: input.brand,
        industry: input.industry,
        targetAudience: input.targetAudience,
        emotionalAppeal: input.emotionalAppeal,
        campaignName: campaign.campaignName,
        keyMessage: campaign.keyMessage
      };
      
      const storytelling = await generateStorytellingNarrative(storytellingInput, openAIConfig);
      campaign.storytelling = storytelling;
    } catch (error) {
      console.error("Error generating storytelling content:", error);
      toast.error("Error generating storytelling content");
    }
    
    try {
      const evaluation = await evaluateCampaign(campaign, openAIConfig);
      campaign.evaluation = evaluation;
    } catch (error) {
      console.error("Error evaluating campaign:", error);
    }
    
    return campaign;
  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};
