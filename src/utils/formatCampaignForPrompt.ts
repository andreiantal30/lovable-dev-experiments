
import { Campaign } from "@/lib/campaignData";

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
