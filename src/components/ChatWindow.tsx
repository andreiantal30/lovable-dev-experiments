
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { OpenAIConfig } from "@/lib/openai";
import ChatHeader from "./chat/ChatHeader";
import ChatMessage from "./chat/ChatMessage";
import ChatLoadingIndicator from "./chat/ChatLoadingIndicator";
import ChatInput from "./chat/ChatInput";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string) => Promise<boolean>;
  isLoading: boolean;
  openAIConfig: OpenAIConfig;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onRegenerateCampaign,
  isLoading,
  openAIConfig,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if input contains keywords that suggest campaign regeneration
  useEffect(() => {
    const regenerationKeywords = [
      'regenerate', 'recreate', 'remake', 'new campaign', 'change campaign',
      'different campaign', 'redo campaign', 'rework', 'revise campaign',
      'create new', 'start over', 'instead', 'prefer', 'rather have'
    ];
    
    const shouldShowButton = regenerationKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword)
    );
    
    setShowRegenerateButton(shouldShowButton && !!onRegenerateCampaign);
  }, [inputValue, onRegenerateCampaign]);

  const handleSendMessage = async (message: string) => {
    try {
      await onSendMessage(message);
      setInputValue("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    }
  };

  const handleRegenerateCampaign = async (feedback: string) => {
    if (!onRegenerateCampaign) return false;
    
    setIsRegenerating(true);
    try {
      const result = await onRegenerateCampaign(feedback);
      return result;
    } catch (error) {
      toast.error("Failed to regenerate campaign");
      console.error("Error regenerating campaign:", error);
      return false;
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg border border-border rounded-xl shadow-subtle overflow-hidden">
      {/* Chat header */}
      <ChatHeader openAIConfig={openAIConfig} />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            index={index} 
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && <ChatLoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onRegenerateCampaign={handleRegenerateCampaign}
          isLoading={isLoading}
          isRegenerating={isRegenerating}
          showRegenerateButton={showRegenerateButton}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
