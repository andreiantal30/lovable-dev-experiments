
import React from "react";
import { MessageSquare } from "lucide-react";
import { OpenAIConfig } from "@/lib/openai";

interface ChatHeaderProps {
  openAIConfig: OpenAIConfig;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ openAIConfig }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary p-1.5 rounded-full">
          <MessageSquare size={18} />
        </div>
        <h3 className="font-medium">Campaign Assistant</h3>
      </div>
      <div className="text-xs text-muted-foreground">
        Model: {openAIConfig.model}
      </div>
    </div>
  );
};

export default ChatHeader;
