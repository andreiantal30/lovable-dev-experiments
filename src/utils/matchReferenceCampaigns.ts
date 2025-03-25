
import { Campaign } from "@/lib/campaignData";
import { CampaignInput } from "@/lib/generateCampaign";
import { findSimilarCampaignsWithEmbeddings } from "@/lib/embeddingsUtil";

/**
 * Primary function for matching reference campaigns using embeddings when available,
 * with fallback to traditional matching
 */
export async function matchReferenceCampaignsWithEmbeddings(
  userInput: CampaignInput,
  allCampaigns: Campaign[],
  openAIConfig: any,
  numberOfResults: number = 3
): Promise<Campaign[]> {
  try {
    // Try to use embedding-based matching first
    console.log("Attempting semantic matching with embeddings...");
    const embeddingMatches = await findSimilarCampaignsWithEmbeddings(
      userInput,
      allCampaigns,
      openAIConfig,
      numberOfResults
    );
    
    if (embeddingMatches && embeddingMatches.length > 0) {
      console.log("Using embedding-based campaign matches:", 
        embeddingMatches.map(c => c.name));
      return embeddingMatches;
    }
  } catch (error) {
    console.error("Error with embedding matching:", error);
  }
  
  console.log("Falling back to traditional keyword matching");
  // Fall back to traditional matching if embedding matching fails
  return matchReferenceCampaigns(userInput, allCampaigns);
}

/**
 * Traditional matching function based on keywords and basic scoring
 */
export function matchReferenceCampaigns(
  userInput: CampaignInput,
  allCampaigns: Campaign[]
): Campaign[] {
  return allCampaigns
    .map((campaign) => {
      let score = 0;

      // Match industry
      if (campaign.industry.toLowerCase() === userInput.industry.toLowerCase()) score += 3;

      // Match target audience - any overlap gets points
      if (userInput.targetAudience && userInput.targetAudience.some(audience => 
        campaign.targetAudience.some(campAudience => 
          campAudience.toLowerCase().includes(audience.toLowerCase()) ||
          audience.toLowerCase().includes(campAudience.toLowerCase())
        )
      )) score += 2;

      // Match emotional appeal - any overlap gets points
      if (userInput.emotionalAppeal && userInput.emotionalAppeal.some(emotion => 
        campaign.emotionalAppeal.some(campEmotion => 
          campEmotion.toLowerCase().includes(emotion.toLowerCase()) ||
          emotion.toLowerCase().includes(campEmotion.toLowerCase())
        )
      )) score += 2;

      // Match objectives
      if (userInput.objectives && userInput.objectives.some(objective => 
        campaign.objectives.some(campObjective => 
          campObjective.toLowerCase().includes(objective.toLowerCase()) ||
          objective.toLowerCase().includes(campObjective.toLowerCase())
        ) ||
        campaign.strategy.toLowerCase().includes(objective.toLowerCase())
      )) score += 1;

      // Match campaign style if present
      if (userInput.campaignStyle && 
          (campaign.strategy.toLowerCase().includes(userInput.campaignStyle.toLowerCase()) ||
           campaign.creativeActivation?.toLowerCase().includes(userInput.campaignStyle.toLowerCase()))) {
        score += 1;
      }

      // Match brand personality if present
      if (userInput.brandPersonality && 
          campaign.brand.toLowerCase().includes(userInput.brandPersonality.toLowerCase())) {
        score += 1;
      }

      return { campaign, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.campaign);
}
