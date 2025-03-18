
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Loader2, MessageSquare, Send, User, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OpenAIConfig } from "@/lib/openai";
import TransitionElement from "./TransitionElement";
import { toast } from "sonner";

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
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading || isRegenerating) return;

    try {
      await onSendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    }
  };

  const handleRegenerateCampaign = async () => {
    if (!onRegenerateCampaign || isRegenerating || inputValue.trim() === "") return;
    
    setIsRegenerating(true);
    try {
      const feedback = inputValue;
      
      // Send message to chat first
      await onSendMessage(feedback);
      setInputValue("");
      
      // Then regenerate campaign
      await onRegenerateCampaign(feedback);
    } catch (error) {
      toast.error("Failed to regenerate campaign");
      console.error("Error regenerating campaign:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(messageId);
    setTimeout(() => setCopied(null), 2000);
  };

  // Format message content to handle potential Markdown
  const formatMessageContent = (content: string) => {
    // For now, we'll just display raw text
    // In a future enhancement, we could convert markdown to HTML
    return content;
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg border border-border rounded-xl shadow-subtle overflow-hidden">
      {/* Chat header */}
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

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.map((message, index) => (
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
                  onClick={() => handleCopyMessage(message.id, message.content)}
                  className="invisible group-hover:visible absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="Copy message"
                >
                  {copied === message.id ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </TransitionElement>
        ))}
        {/* Loading indicator */}
        {isLoading && (
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
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or provide feedback..."
            disabled={isLoading || isRegenerating}
            className="flex-1"
          />
          
          {showRegenerateButton && onRegenerateCampaign && (
            <Button 
              type="button" 
              onClick={handleRegenerateCampaign}
              variant="outline"
              disabled={isLoading || isRegenerating || !inputValue.trim()} 
              className="gap-1"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          )}
          
          <Button type="submit" size="icon" disabled={isLoading || isRegenerating || !inputValue.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
