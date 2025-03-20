
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import { Message } from "@/components/ChatWindow";

// Customization options for the AI's writing style
const customWritingStyle = `
As a creative strategist, tailor your thinking and writing with these instructions:
- Use concise language with minimal jargon
- Focus on practical, actionable ideas over theoretical concepts 
- Prioritize bold, unexpected creative approaches
- Provide rationale for suggestions, not just the ideas themselves
- When discussing improvements, be specific about execution details
- Balance creativity with business practicality
- Emphasize how campaigns can generate word-of-mouth and virality
- Write in a confident, authoritative tone with occasional humor
- Use analogies and examples from other industries when relevant
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
