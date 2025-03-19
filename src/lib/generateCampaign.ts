
import { Campaign } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';
import { getCampaigns } from './campaignStorage';
import { generateStorytellingNarrative, StorytellingOutput } from './storytellingGenerator';

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
}

// Sentiment categories for more nuanced matching
type SentimentCategory = 'positive' | 'neutral' | 'negative';
type ToneCategory = 'formal' | 'casual' | 'humorous' | 'serious' | 'inspirational';

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

/**
 * Determine sentiment category based on emotional appeal
 */
const determineSentiment = (emotionalAppeal: string[]): SentimentCategory => {
  const positiveEmotions = ['joy', 'happiness', 'excitement', 'optimism', 'inspiration', 'pride', 'comfort'];
  const negativeEmotions = ['fear', 'anxiety', 'sadness', 'anger', 'guilt', 'shame'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  emotionalAppeal.forEach(emotion => {
    const lowerEmotion = emotion.toLowerCase();
    if (positiveEmotions.some(e => lowerEmotion.includes(e))) {
      positiveCount++;
    } else if (negativeEmotions.some(e => lowerEmotion.includes(e))) {
      negativeCount++;
    }
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

/**
 * Determine tone category based on objectives and emotional appeal
 */
const determineTone = (objectives: string[], emotionalAppeal: string[]): ToneCategory => {
  // Check for formal indicators
  if (
    objectives.some(obj => obj.toLowerCase().includes('professional') || 
                           obj.toLowerCase().includes('authority') ||
                           obj.toLowerCase().includes('credibility'))
  ) {
    return 'formal';
  }
  
  // Check for humorous indicators
  if (
    emotionalAppeal.some(emo => emo.toLowerCase().includes('fun') || 
                               emo.toLowerCase().includes('humor') ||
                               emo.toLowerCase().includes('playful'))
  ) {
    return 'humorous';
  }
  
  // Check for inspirational indicators
  if (
    emotionalAppeal.some(emo => emo.toLowerCase().includes('inspir') || 
                               emo.toLowerCase().includes('motivat') ||
                               emo.toLowerCase().includes('empower'))
  ) {
    return 'inspirational';
  }
  
  // Check for serious indicators
  if (
    objectives.some(obj => obj.toLowerCase().includes('awareness') || 
                           obj.toLowerCase().includes('education') ||
                           obj.toLowerCase().includes('social change'))
  ) {
    return 'serious';
  }
  
  // Default to casual
  return 'casual';
};

/**
 * Enhanced function to find similar campaigns based on multi-dimensional scoring
 */
const findSimilarCampaigns = (input: CampaignInput): Campaign[] => {
  // Get campaigns from local storage or use default data
  const allCampaigns = getCampaigns();
  
  const inputSentiment = determineSentiment(input.emotionalAppeal);
  const inputTone = determineTone(input.objectives, input.emotionalAppeal);
  
  // Score each campaign based on multiple dimensions
  const scoredCampaigns: EnhancedSimilarityScore[] = allCampaigns.map(campaign => {
    // Initialize dimension scores
    const dimensionScores = {
      industry: 0,
      audience: 0,
      objectives: 0,
      emotion: 0,
      style: 0,
      sentiment: 0,
      tone: 0
    };
    
    // Industry match (0-5 points)
    if (campaign.industry.toLowerCase() === input.industry.toLowerCase()) {
      dimensionScores.industry = 5;
    } else if (campaign.industry.toLowerCase().includes(input.industry.toLowerCase()) || 
              input.industry.toLowerCase().includes(campaign.industry.toLowerCase())) {
      dimensionScores.industry = 3;
    }
    
    // Target audience match (0-5 points per match, max 15)
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
    
    // Objectives match (0-5 points per match, max 15)
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
    
    // Emotional appeal match (0-5 points per match, max 15)
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
    
    // Campaign style match (0-10 points)
    if (input.campaignStyle) {
      // Extract campaign style hints from the campaign strategy and key message
      const campaignText = (campaign.strategy + ' ' + campaign.keyMessage).toLowerCase();
      
      // Map of style identifiers to keywords
      const styleKeywords: Record<string, string[]> = {
        'digital': ['digital', 'online', 'website', 'app', 'mobile'],
        'experiential': ['experience', 'event', 'activation', 'immersive', 'interactive'],
        'social': ['social media', 'social network', 'community', 'user generated'],
        'influencer': ['influencer', 'creator', 'personality', 'ambassador', 'celebrity'],
        'guerrilla': ['guerrilla', 'unconventional', 'unexpected', 'surprise', 'street'],
        'ugc': ['user generated', 'ugc', 'community content', 'fan content'],
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
      
      // Check if the campaign text contains keywords related to the selected style
      const relevantKeywords = styleKeywords[input.campaignStyle] || [];
      const matchCount = relevantKeywords.filter(keyword => campaignText.includes(keyword)).length;
      
      if (matchCount > 0) {
        dimensionScores.style = Math.min(matchCount * 2.5, 10); // 2.5 points per keyword match, max 10
      }
    }
    
    // Sentiment analysis match (0-10 points)
    const campaignSentiment = determineSentiment(campaign.emotionalAppeal);
    if (inputSentiment === campaignSentiment) {
      dimensionScores.sentiment = 10;
    } else if (
      (inputSentiment === 'neutral' && campaignSentiment !== 'neutral') || 
      (campaignSentiment === 'neutral' && inputSentiment !== 'neutral')
    ) {
      dimensionScores.sentiment = 5;
    }
    
    // Tone match (0-10 points)
    const campaignTone = determineTone(campaign.objectives, campaign.emotionalAppeal);
    if (inputTone === campaignTone) {
      dimensionScores.tone = 10;
    } else {
      // Some tones are more compatible than others
      const toneCompatibility: Record<ToneCategory, Record<ToneCategory, number>> = {
        'formal': { 'casual': 3, 'humorous': 1, 'serious': 7, 'inspirational': 5, 'formal': 10 },
        'casual': { 'formal': 3, 'humorous': 7, 'serious': 3, 'inspirational': 5, 'casual': 10 },
        'humorous': { 'formal': 1, 'casual': 7, 'serious': 1, 'inspirational': 3, 'humorous': 10 },
        'serious': { 'formal': 7, 'casual': 3, 'humorous': 1, 'inspirational': 5, 'serious': 10 },
        'inspirational': { 'formal': 5, 'casual': 5, 'humorous': 3, 'serious': 5, 'inspirational': 10 }
      };
      
      dimensionScores.tone = toneCompatibility[inputTone][campaignTone];
    }
    
    // Calculate total score
    const totalScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0);
    
    return {
      campaign,
      totalScore,
      dimensionScores
    };
  });
  
  // Use dimension diversity for selection
  // First, get top 10 by total score
  const topScoring = scoredCampaigns
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
  
  // Then, select 3 campaigns that maximize diversity across dimensions
  const selected: EnhancedSimilarityScore[] = [];
  
  // Always include the highest scoring campaign
  selected.push(topScoring[0]);
  
  // For the next selections, prefer campaigns that are strong in dimensions
  // where currently selected campaigns are weaker
  while (selected.length < 3 && selected.length < topScoring.length) {
    // Calculate average dimension scores for currently selected campaigns
    const avgDimensionScores: Record<string, number> = {};
    Object.keys(topScoring[0].dimensionScores).forEach(dimension => {
      avgDimensionScores[dimension] = selected.reduce(
        (sum, item) => sum + item.dimensionScores[dimension as keyof typeof item.dimensionScores], 
        0
      ) / selected.length;
    });
    
    // Find campaign that's strong where current selection is weak
    let bestComplement: EnhancedSimilarityScore | null = null;
    let bestComplementScore = -1;
    
    for (const candidate of topScoring) {
      // Skip if already selected
      if (selected.some(s => s.campaign.id === candidate.campaign.id)) {
        continue;
      }
      
      // Calculate how well this candidate complements existing selection
      let complementScore = 0;
      Object.entries(avgDimensionScores).forEach(([dimension, avgScore]) => {
        const dimensionKey = dimension as keyof typeof candidate.dimensionScores;
        // If we're weak in this dimension and candidate is strong, that's good
        if (avgScore < 7 && candidate.dimensionScores[dimensionKey] > avgScore) {
          complementScore += (candidate.dimensionScores[dimensionKey] - avgScore);
        }
      });
      
      if (complementScore > bestComplementScore) {
        bestComplementScore = complementScore;
        bestComplement = candidate;
      }
    }
    
    // If we found a good complement, add it; otherwise just take next highest scoring
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
  
  console.log('Enhanced campaign selection:', selected.map(s => ({
    name: s.campaign.name,
    score: s.totalScore,
    dimensions: s.dimensionScores
  })));
  
  return selected.map(s => s.campaign);
};

/**
 * Creates a detailed prompt for OpenAI to generate a creative campaign
 */
const createCampaignPrompt = (input: CampaignInput, referenceCampaigns: Campaign[]): string => {
  const referenceCampaignsText = referenceCampaigns.map(campaign => {
    return `
Campaign Name: ${campaign.name}
Brand: ${campaign.brand}
Industry: ${campaign.industry}
Target Audience: ${campaign.targetAudience.join(', ')}
Objectives: ${campaign.objectives.join(', ')}
Key Message: ${campaign.keyMessage}
Strategy: ${campaign.strategy}
Emotional Appeal: ${campaign.emotionalAppeal.join(', ')}
Creative Activation: ${campaign.creativeActivation || 'N/A'}
Viral Element: ${campaign.viralElement || 'N/A'}
`;
  }).join('\n');

  // Generate campaign style description
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

  return `### Generate a groundbreaking marketing campaign with the following key elements:

#### **Brand & Strategic Positioning**
- **Brand Name:** ${input.brand}
- **Industry:** ${input.industry}
- **Target Audience:** ${input.targetAudience.join(', ')}
- **Brand Personality:** ${input.brandPersonality || 'Flexible – Adapt to campaign needs'}
- **Competitive Differentiator:** ${input.differentiator || 'N/A'}
- **Current Market Trends / Cultural Insights to Consider:** ${input.culturalInsights || 'N/A'}
- **Emotional Appeal to Tap Into:** ${input.emotionalAppeal.join(', ')}

#### **Campaign Details**
- **Primary Objective:** ${input.objectives.join(', ')}
- **Campaign Style:** ${campaignStyleDescription}
- **Additional Constraints:** ${input.additionalConstraints || 'None'}

#### **Reference Campaigns for Inspiration**
${referenceCampaignsText}

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
  "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"]
}
\`\`\`

---

### **Guidelines:**
- **Make it groundbreaking:** Think beyond traditional ads—consider experiential, tech-driven, or culture-hacking approaches.  
- **Make it insightful:** Tie the campaign to a real-world trend, behavior, or cultural moment.  
- **Make it entertaining:** Infuse humor, surprise, or an emotional twist to make the campaign unforgettable.  

---

**Objective:** Generate a campaign that feels like an award-winning, culture-defining moment rather than just another ad. 🚀  
`;
};

/**
 * Extracts JSON from a potentially markdown-formatted string
 * This handles cases where OpenAI returns JSON wrapped in markdown code blocks
 */
const extractJsonFromResponse = (text: string): string => {
  // Check if the response is wrapped in markdown code blocks
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);
  
  // If we found a JSON block in markdown format, extract it
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Otherwise return the original text
  return text.trim();
};

// Main function to generate a campaign
export const generateCampaign = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // Find similar reference campaigns with enhanced scoring
    const referenceCampaigns = findSimilarCampaigns(input);
    
    // Create a detailed prompt for OpenAI
    const prompt = createCampaignPrompt(input, referenceCampaigns);
    
    // Generate campaign using OpenAI
    const response = await generateWithOpenAI(prompt, openAIConfig);
    
    // Clean the response to extract just the JSON
    const cleanedResponse = extractJsonFromResponse(response);
    
    // Parse the JSON response
    const generatedContent = JSON.parse(cleanedResponse);
    
    // Create the base campaign with references
    const campaign: GeneratedCampaign = {
      ...generatedContent,
      referenceCampaigns
    };
    
    // Generate storytelling narrative
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
      // Continue without storytelling if it fails
    }
    
    return campaign;
  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};
