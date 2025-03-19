
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import { Message } from "@/components/ChatWindow";

export function useCampaignChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  const initializeChat = (campaign: GeneratedCampaign, input: CampaignInput) => {
    const initialMessages: Message[] = [
      {
        id: uuidv4(),
        role: "system",
        content: `I've created a campaign for ${input.brand} in the ${input.industry} industry. You can ask me questions about it or request refinements.`,
        timestamp: new Date(),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I've generated a creative campaign called "${campaign.campaignName}" for ${input.brand}. The key message is: "${campaign.keyMessage}". What aspects would you like to refine or discuss further?`,
        timestamp: new Date(),
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
