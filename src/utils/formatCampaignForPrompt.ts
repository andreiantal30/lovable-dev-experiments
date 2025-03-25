
import { Campaign } from "@/lib/campaignData";
import { CampaignFeedbackData } from "@/components/FeedbackSystem";

export function formatCampaignForPrompt(campaign: Campaign): string {
  return `
🟣 Campaign: ${campaign.name} (${campaign.brand}, ${campaign.year || 'N/A'})
🎯 Core Idea: ${campaign.keyMessage || 'N/A'}
🧠 Human Insight: ${campaign.objectives.join(', ') || 'N/A'} 
💡 Creative Concept: ${campaign.strategy || 'N/A'}
🎭 Emotional Appeals: ${campaign.emotionalAppeal.join(', ') || 'N/A'}
📊 Outcome: ${campaign.outcomes.join(', ') || 'N/A'}
${campaign.creativeActivation ? `📱 Activation: ${campaign.creativeActivation}` : ''}
${campaign.viralElement ? `🔥 Viral Element: ${campaign.viralElement}` : ''}
`;
}

export function formatFeedbackForPrompt(feedback: CampaignFeedbackData): string {
  // Convert thumbs up/down ratings to text
  const getRatingText = (value: number): string => {
    if (value === 1) return "👍 Positive";
    if (value === -1) return "👎 Negative";
    return "⚪ Neutral";
  };

  return `
User Feedback:
⭐ Overall Rating: ${feedback.overallRating}/5
${getRatingText(feedback.elementRatings.campaignName)} - Campaign Name
${getRatingText(feedback.elementRatings.keyMessage)} - Key Message
${getRatingText(feedback.elementRatings.creativeStrategy)} - Creative Strategy
${getRatingText(feedback.elementRatings.executionPlan)} - Execution Plan
${feedback.comments ? `💬 Comments: "${feedback.comments}"` : ''}
`;
}

// Calculates similarity score between feedback and a campaign
export function calculateFeedbackSimilarity(
  feedback: CampaignFeedbackData, 
  campaign: Campaign
): number {
  // This is a simple scoring model that can be expanded
  let score = 0;
  
  // If user liked campaign names and this campaign has a memorable name
  if (feedback.elementRatings.campaignName === 1 && campaign.name.length > 0) {
    score += 1;
  }
  
  // If user liked key messages and this campaign has a strong message
  if (feedback.elementRatings.keyMessage === 1 && campaign.keyMessage && campaign.keyMessage.length > 0) {
    score += 1;
  }
  
  // If user liked creative strategies and this campaign has a detailed strategy
  if (feedback.elementRatings.creativeStrategy === 1 && campaign.strategy && campaign.strategy.length > 10) {
    score += 1;
  }
  
  // If user disliked certain elements, penalize campaigns with similar characteristics
  if (feedback.elementRatings.campaignName === -1) {
    // Penalize campaigns with similar naming patterns
    // This is just a simple example - could be enhanced with NLP
    score -= 0.5;
  }
  
  return score;
}
