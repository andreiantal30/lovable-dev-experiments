
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
import { Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  chatMemory?: {
    pastInteractions: Message[];
    userPreferences: Record<string, any>;
  };
}

const ChatWindow = ({
  messages,
  onSendMessage,
  onRegenerateCampaign,
  onApplyChangesAndRegenerate,
  isLoading,
  openAIConfig,
  className,
  persona,
  chatMemory
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Check if we have saved preferences
  const hasMemory = chatMemory && (
    Object.keys(chatMemory.userPreferences).length > 0 || 
    chatMemory.pastInteractions.length > 0
  );

  return (
    <Card className={cn("overflow-hidden border shadow-md p-0", className)}>
      <ChatHeader openAIConfig={openAIConfig}>
        {hasMemory && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                  <Brain className="h-3.5 w-3.5" />
                  <span>Memory Active</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2 max-w-xs">
                  <p className="text-xs font-medium">AI Memory Active</p>
                  {chatMemory?.userPreferences.preferredTone && (
                    <p className="text-xs">Preferred tone: {chatMemory.userPreferences.preferredTone}</p>
                  )}
                  {chatMemory?.userPreferences.lastLikedCampaignType && (
                    <p className="text-xs">Liked campaign type: {chatMemory.userPreferences.lastLikedCampaignType}</p>
                  )}
                  <p className="text-xs opacity-80">The AI remembers your preferences and past interactions</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </ChatHeader>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
          <ChatMessage key={message.id} message={message} index={index} />
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
