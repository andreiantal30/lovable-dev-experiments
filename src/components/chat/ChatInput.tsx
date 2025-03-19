
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Wand2, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string, targetSection?: string) => Promise<boolean>;
  isLoading: boolean;
  isRegenerating: boolean;
  showRegenerateButton: boolean;
}

const refinementSections = [
  { id: "campaignName", label: "Campaign Name" },
  { id: "keyMessage", label: "Key Message" },
  { id: "creativeStrategy", label: "Creative Strategy" },
  { id: "executionPlan", label: "Execution Plan" },
  { id: "viralElement", label: "Viral Element" },
  { id: "callToAction", label: "Call to Action" },
  { id: "emotionalAppeal", label: "Emotional Appeal" },
];

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onRegenerateCampaign,
  isLoading,
  isRegenerating,
  showRegenerateButton,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [targetSection, setTargetSection] = useState<string | undefined>(undefined);
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
      setTargetSection(undefined);
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
      
      // Then regenerate campaign section
      await onRegenerateCampaign(feedback, targetSection);
      setTargetSection(undefined);
    } catch (error) {
      console.error("Error regenerating campaign:", error);
    }
  };

  const selectSectionToRefine = (sectionId: string) => {
    setTargetSection(sectionId);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {targetSection && (
        <div className="flex items-center px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Refining: {refinementSections.find(s => s.id === targetSection)?.label || targetSection}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-1.5 ml-1.5 text-xs"
            onClick={() => setTargetSection(undefined)}
          >
            Clear
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={targetSection 
            ? `Provide feedback for the ${refinementSections.find(s => s.id === targetSection)?.label}...` 
            : "Ask a question or provide feedback..."
          }
          disabled={isLoading || isRegenerating}
          className="flex-1"
        />
        
        {showRegenerateButton && onRegenerateCampaign && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline"
                disabled={isLoading || isRegenerating || !inputValue.trim()} 
                className="gap-1"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{targetSection ? "Refine" : "Regenerate"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="end">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground px-2 py-1.5">Select section to refine:</p>
                {refinementSections.map(section => (
                  <Button
                    key={section.id}
                    variant={targetSection === section.id ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    onClick={() => selectSectionToRefine(section.id)}
                  >
                    {section.label}
                  </Button>
                ))}
                <Button
                  variant={!targetSection ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setTargetSection(undefined)}
                >
                  Entire Campaign
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button 
          type="button" 
          onClick={handleRegenerateCampaign}
          variant="outline"
          disabled={isLoading || isRegenerating || !inputValue.trim() || !showRegenerateButton || !onRegenerateCampaign} 
          className="sm:hidden"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          type="submit" 
          size="icon" 
          disabled={isLoading || isRegenerating || !inputValue.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
