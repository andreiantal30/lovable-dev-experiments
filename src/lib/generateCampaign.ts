
import { Campaign, campaignData } from './campaignData';
import { generateWithOpenAI, OpenAIConfig, defaultOpenAIConfig } from './openai';

export interface CampaignInput {
  brand: string;
  industry: string;
  targetAudience: string[];
  objectives: string[];
  emotionalAppeal: string[];
  additionalConstraints?: string;
  campaignStyle?: "digital" | "experiential" | "social";
}

export interface GeneratedCampaign {
  campaignName: string;
  keyMessage: string;
  creativeStrategy: string[];
  executionPlan: string[];
  expectedOutcomes: string[];
  referenceCampaigns: Campaign[];
}

// Helper function to find similar campaigns based on input
const findSimilarCampaigns = (input: CampaignInput): Campaign[] => {
  // Score each campaign based on similarities
  const scoredCampaigns = campaignData.map(campaign => {
    let score = 0;
    
    // Match industry
    if (campaign.industry.toLowerCase() === input.industry.toLowerCase()) {
      score += 3;
    }
    
    // Match target audience (partial matches)
    input.targetAudience.forEach(audience => {
      if (campaign.targetAudience.some(a => a.toLowerCase().includes(audience.toLowerCase()))) {
        score += 2;
      }
    });
    
    // Match objectives (partial matches)
    input.objectives.forEach(objective => {
      if (campaign.objectives.some(o => o.toLowerCase().includes(objective.toLowerCase()))) {
        score += 2;
      }
    });
    
    // Match emotional appeal
    input.emotionalAppeal.forEach(emotion => {
      if (campaign.emotionalAppeal.some(e => e.toLowerCase().includes(emotion.toLowerCase()))) {
        score += 2;
      }
    });
    
    return { campaign, score };
  });
  
  // Sort by score and take top 3
  return scoredCampaigns
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(sc => sc.campaign);
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
`;
  }).join('\n');

  return `Generate a creative marketing campaign for the following brand and requirements:

BRAND INFORMATION:
Brand Name: ${input.brand}
Industry: ${input.industry}
Target Audience: ${input.targetAudience.join(', ')}
Campaign Objectives: ${input.objectives.join(', ')}
Emotional Appeal to Focus On: ${input.emotionalAppeal.join(', ')}
Campaign Style: ${input.campaignStyle || 'Any (digital, experiential, or social)'}
${input.additionalConstraints ? `Additional Requirements: ${input.additionalConstraints}` : ''}

REFERENCE CAMPAIGNS FOR INSPIRATION:
${referenceCampaignsText}

Please create a comprehensive campaign with the following components:
1. A creative and memorable campaign name
2. A powerful key message that resonates with the target audience
3. Three innovative creative strategy points
4. Five detailed execution plan items
5. Four expected outcomes or KPIs

Format your response as JSON in the following structure:
{
  "campaignName": "Name of Campaign",
  "keyMessage": "The key message",
  "creativeStrategy": ["Strategy point 1", "Strategy point 2", "Strategy point 3"],
  "executionPlan": ["Execution item 1", "Execution item 2", "Execution item 3", "Execution item 4", "Execution item 5"],
  "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"]
}

Make the campaign innovative, impactful, and aligned with current marketing trends. Ensure it addresses the specific objectives and connects emotionally with the target audience.`;
};

// Main function to generate a campaign
export const generateCampaign = async (
  input: CampaignInput, 
  openAIConfig: OpenAIConfig = defaultOpenAIConfig
): Promise<GeneratedCampaign> => {
  try {
    // Find similar reference campaigns
    const referenceCampaigns = findSimilarCampaigns(input);
    
    // Create a detailed prompt for OpenAI
    const prompt = createCampaignPrompt(input, referenceCampaigns);
    
    // Generate campaign using OpenAI
    const response = await generateWithOpenAI(prompt, openAIConfig);
    
    // Parse the JSON response
    const generatedContent = JSON.parse(response);
    
    // Return the campaign with references
    return {
      ...generatedContent,
      referenceCampaigns
    };
  } catch (error) {
    console.error("Error generating campaign:", error);
    throw error;
  }
};
