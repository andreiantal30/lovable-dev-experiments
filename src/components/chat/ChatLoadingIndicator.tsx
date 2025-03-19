
import React from "react";
import { Loader2, MessageSquare } from "lucide-react";
import TransitionElement from "../TransitionElement";

const ChatLoadingIndicator: React.FC = () => {
  return (
    <TransitionElement animation="fade" className="flex items-center gap-3 max-w-[85%]">
      <div className="bg-secondary/50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary">
          <MessageSquare size={14} />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </TransitionElement>
  );
};

export default ChatLoadingIndicator;
