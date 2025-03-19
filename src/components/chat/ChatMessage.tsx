
import React, { useState } from "react";
import { Check, Copy, MessageSquare, User, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TransitionElement from "../TransitionElement";
import { Message } from "../ChatWindow";

interface ChatMessageProps {
  message: Message;
  index: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format message content to handle potential Markdown
  const formatMessageContent = (content: string) => {
    // For now, we'll just display raw text
    // In a future enhancement, we could convert markdown to HTML
    return content;
  };

  return (
    <TransitionElement 
      key={message.id} 
      animation="slide-up" 
      delay={index * 50}
      className={cn(
        "flex gap-3 max-w-full",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "group relative flex max-w-[85%] items-start gap-3 rounded-xl p-4",
          message.role === "user"
            ? "ml-auto bg-primary text-white"
            : message.role === "system" 
              ? "bg-amber-100/50 dark:bg-amber-900/20"
              : "bg-secondary/50 dark:bg-gray-700/50"
        )}
      >
        <div className="flex-shrink-0 w-6 h-6">
          {message.role === "assistant" ? (
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <MessageSquare size={14} />
            </div>
          ) : message.role === "system" ? (
            <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Wand2 size={14} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <User size={14} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm whitespace-pre-wrap break-words",
            message.role === "user" ? "text-white" : 
            message.role === "system" ? "text-amber-800 dark:text-amber-300" :
            "text-foreground dark:text-white/90"
          )}>
            {formatMessageContent(message.content)}
          </p>
          <div className="mt-1 text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {message.role === "assistant" && (
          <button
            onClick={() => handleCopyMessage(message.content)}
            className="invisible group-hover:visible absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Copy message"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </TransitionElement>
  );
};

export default ChatMessage;
