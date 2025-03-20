
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatInput from "@/components/chat/ChatInput";
import { Card } from "@/components/ui/card";
import { OpenAIConfig } from "@/lib/openai";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatLoadingIndicator from "@/components/chat/ChatLoadingIndicator";
import { cn } from "@/lib/utils";
import { PersonaType } from "@/types/persona";

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id: string;
  timestamp: number;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string, targetSection?: string) => Promise<boolean>;
  onApplyChangesAndRegenerate?: () => Promise<boolean>;
  isLoading: boolean;
  openAIConfig: OpenAIConfig;
  className?: string;
  persona?: PersonaType;
}

const ChatWindow = ({
  messages,
  onSendMessage,
  onRegenerateCampaign,
  onApplyChangesAndRegenerate,
  isLoading,
  openAIConfig,
  className,
  persona
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Card className={cn("overflow-hidden border shadow-md p-0", className)}>
      <ChatHeader openAIConfig={openAIConfig} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
        {messages.filter(msg => msg.role !== 'system').map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <ChatLoadingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <ChatInput 
          onSendMessage={onSendMessage}
          onRegenerateCampaign={onRegenerateCampaign}
          onApplyChangesAndRegenerate={onApplyChangesAndRegenerate}
          isLoading={isLoading}
          isRegenerating={false}
          showRegenerateButton={!!onRegenerateCampaign}
          persona={persona}
        />
      </div>
    </Card>
  );
};

export default ChatWindow;
