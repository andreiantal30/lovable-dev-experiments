
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Wand2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string) => Promise<boolean>;
  isLoading: boolean;
  isRegenerating: boolean;
  showRegenerateButton: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onRegenerateCampaign,
  isLoading,
  isRegenerating,
  showRegenerateButton,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isLoading || isRegenerating) return;

    try {
      await onSendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleRegenerateCampaign = async () => {
    if (!onRegenerateCampaign || isRegenerating || inputValue.trim() === "") return;
    
    try {
      const feedback = inputValue;
      
      // Send message to chat first
      await onSendMessage(feedback);
      setInputValue("");
      
      // Then regenerate campaign
      await onRegenerateCampaign(feedback);
    } catch (error) {
      console.error("Error regenerating campaign:", error);
    }
  };

  return (
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
  );
};

export default ChatInput;
