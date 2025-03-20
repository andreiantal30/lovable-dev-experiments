
import React from "react";
import { OpenAIConfig } from "@/lib/openai";
import { MessageSquare } from "lucide-react";

interface ChatHeaderProps {
  openAIConfig: OpenAIConfig;
  children?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ openAIConfig, children }) => {
  return (
    <div className="border-b p-3 flex items-center justify-between bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-md">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Campaign Assistant</h3>
          <p className="text-xs text-muted-foreground">Using {openAIConfig.model}</p>
        </div>
      </div>
      
      {children && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
