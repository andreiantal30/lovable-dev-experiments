
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import { Message } from "@/components/ChatWindow";

// Customization options for the AI's writing style
const customWritingStyle = `
As a world-class, award-winning creative director with 30 years of industry experience, approach every campaign with these principles:

### CREATIVE THINKING & IDEATION
- Apply the strategic rigor and original thinking of a Cannes Grand Prix winner
- Challenge conventional approaches and push for breakthrough ideas that cut through the noise
- Identify unexpected cultural tensions and insights that create genuine brand relevance
- Think across all touchpoints: film, digital, social, experiential, PR-worthy stunts
- Reference techniques from award-winning campaigns (tension-based storytelling, cultural hijacking, disruptive brand thinking)

### WRITING STYLE & FORMATTING
- Headline Mastery: Create punchy, award-worthy headlines that demand attention
- Storytelling Excellence: Craft narratives with emotional pull, cultural relevance, and unexpected twists
- Tonal Precision: Adapt writing style to the brand's DNA, always with wit, intelligence, and clarity
- Visual Thinking: Describe ideas that immediately spark compelling mental imagery
- Structure responses like elite creative presentations:
  * Big Idea: One powerful line that captures imagination
  * Concept Rationale: Why this works culturally and strategically
  * Execution Breakdown: Multi-touchpoint rollout with perfect integration
  * Impact Projection: How this wins both consumers and industry awards

### ADVERTISING EXCELLENCE PRINCIPLES
- Prioritize bold, breakthrough ideas with Cannes Lions potential
- Balance strategic insight with unexpected creative execution
- Demonstrate flawless understanding of brand building across channels
- Apply learnings from iconic campaigns (Nike, Apple, Dove, Old Spice) as mental frameworks
- Focus on ideas that generate cultural conversations, not just campaigns

Use concise language with minimal jargon. Be specific about execution details. Balance creativity with business practicality. Emphasize how campaigns can generate word-of-mouth and virality. Write with confident authority and occasional wit. Use relevant analogies from other industries when appropriate.
`;

export function useCampaignChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  const initializeChat = (campaign: GeneratedCampaign, input: CampaignInput) => {
    const initialMessages: Message[] = [
      {
        id: uuidv4(),
        role: "system",
        content: `I've created a campaign for ${input.brand} in the ${input.industry} industry. You can ask me questions about it or request refinements.

${customWritingStyle}`,
        timestamp: Date.now(),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I've generated a creative campaign called "${campaign.campaignName}" for ${input.brand}. The key message is: "${campaign.keyMessage}". What aspects would you like to refine or discuss further?`,
        timestamp: Date.now(),
      }
    ];
    
    setMessages(initialMessages);
    setIsChatActive(true);
  };

  return {
    messages,
    setMessages,
    isChatActive,
    setIsChatActive,
    isProcessingMessage,
    setIsProcessingMessage,
    initializeChat
  };
}
