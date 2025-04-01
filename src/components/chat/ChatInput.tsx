
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Wand2, RefreshCw, RotateCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PromptCarousel from "./PromptCarousel";
import { PersonaType } from "@/types/persona";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string, targetSection?: string) => Promise<boolean>;
  onApplyChangesAndRegenerate?: () => Promise<boolean>;
  isLoading: boolean;
  isRegenerating: boolean;
  showRegenerateButton: boolean;
  persona?: PersonaType;
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

// Default prompt suggestions
const defaultPromptSuggestions = [
  "Want to refine the messaging? Try asking for a stronger call to action or a punchier headline!",
  "Looking to enhance the emotional appeal? Ask for a more relatable story or an unexpected twist!",
  "Need a different angle? Ask for a more viral approach, a bold influencer collab, or a trend-driven hook!",
  "How about optimizing for specific platforms? Request a TikTok-ready version or a more engaging Instagram campaign!",
  "Want a tighter focus? Ask to refine the target audience or shift the tone for broader appeal!"
];

// Persona-specific prompt suggestions
const personaPromptSuggestions: Record<PersonaType, string[]> = {
  "bold-risk-taker": [
    "How can we make this campaign more provocative or unexpected?",
    "Could you push the boundaries further with a more controversial approach?",
    "What if we took a bigger creative risk with this campaign?",
    "How might we create a more surprising twist that challenges conventions?",
    "Let's make this more disruptive - what bold element could we add?"
  ],
  "safe-brand-builder": [
    "How can we ensure this campaign maintains brand consistency?",
    "Can you suggest a more proven approach that still feels fresh?",
    "What elements would build long-term brand equity while still being effective?",
    "How might we make this campaign more trustworthy and reliable?",
    "Can you refine this to better emphasize the brand's core values?"
  ],
  "viral-trend-expert": [
    "How could we incorporate a trending hashtag or challenge format?",
    "What viral mechanic would make this more shareable across platforms?",
    "Could you optimize this for TikTok's specific audience and algorithm?",
    "What unexpected cultural crossover would make this more viral?",
    "How can we create a stronger participation element for this campaign?"
  ],
  "storytelling-artist": [
    "How could we develop a more emotionally rich narrative arc?",
    "What character-driven approach would make this more compelling?",
    "Can you add a more authentic emotional journey to this campaign?",
    "How might we create a more immersive storytelling experience?",
    "What unexpected twist would make this story more memorable?"
  ],
  "data-driven-strategist": [
    "How could we optimize this campaign for better conversion metrics?",
    "What specific audience segments should we target with variations?",
    "How might we structure this for easier A/B testing of elements?",
    "What measurable benchmarks would indicate success for this approach?",
    "Can you suggest specific data collection points to improve performance?"
  ]
};

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onRegenerateCampaign,
  onApplyChangesAndRegenerate,
  isLoading,
  isRegenerating,
  showRegenerateButton,
  persona
}) => {
  const [inputValue, setInputValue] = useState("");
  const [targetSection, setTargetSection] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Focus input when component mounts
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() === "" || isLoading || isRegenerating) return;

    try {
      await onSendMessage(inputValue);
      setInputValue("");
      setTargetSection(undefined);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Enter without Shift or Cmd/Ctrl to send message
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault(); // Prevent default to avoid newline
      handleSubmit();
    }
    
    // Allow Shift+Enter or Cmd/Ctrl+Enter for newline
    // This is the default behavior, so we don't need to do anything special
  };

  const handleRegenerateCampaign = async () => {
    if (!onRegenerateCampaign || isRegenerating || inputValue.trim() === "") return;
    
    try {
      const feedback = inputValue;
      
      // Send message to chat first
      await onSendMessage(feedback);
      setInputValue("");
      setIsTyping(false);
      
      // Then regenerate campaign section
      await onRegenerateCampaign(feedback, targetSection);
      setTargetSection(undefined);
    } catch (error) {
      console.error("Error regenerating campaign:", error);
    }
  };

  const handleApplyChangesAndRegenerate = async () => {
    if (!onApplyChangesAndRegenerate || isRegenerating) return;
    
    try {
      await onApplyChangesAndRegenerate();
    } catch (error) {
      console.error("Error applying changes and regenerating campaign:", error);
    }
  };

  const selectSectionToRefine = (sectionId: string) => {
    setTargetSection(sectionId);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTyping(newValue.length > 0);
  };

  const handlePromptClick = (prompt: string) => {
    // Extract the suggestion part after "Try asking for" or similar phrases
    const suggestionMatch = prompt.match(/(?:try asking for|ask for|request|how can we|could you|what if|how might|let's|can you)(.*?)(?:!|\?|$)/i);
    const suggestion = suggestionMatch ? suggestionMatch[1].trim() : prompt;
    
    // Set a simplified version of the prompt as input
    setInputValue(`Can you ${suggestion.toLowerCase()}?`);
    setIsTyping(true);
    inputRef.current?.focus();
  };
  
  // Determine which prompt suggestions to use based on persona
  const promptSuggestions = persona && personaPromptSuggestions[persona] 
    ? personaPromptSuggestions[persona] 
    : defaultPromptSuggestions;

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
        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={targetSection 
              ? `Provide feedback for the ${refinementSections.find(s => s.id === targetSection)?.label}...` 
              : "Ask a question or provide feedback..."
            }
            disabled={isLoading || isRegenerating}
            className="flex-1 min-h-[60px] max-h-32 resize-none"
            rows={3}
          />
          
          {/* Prompt Carousel - positioned absolutely within the textarea */}
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
            <div className="pointer-events-auto">
              <PromptCarousel 
                prompts={promptSuggestions}
                isTyping={isTyping || isLoading || isRegenerating}
                onPromptClick={handlePromptClick}
              />
            </div>
          </div>
        </div>
        
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
          onClick={() => handleSubmit()} 
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

      {/* Apply Changes & Regenerate Campaign button */}
      {onApplyChangesAndRegenerate && (
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleApplyChangesAndRegenerate}
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            disabled={isLoading || isRegenerating}
          >
            <RotateCw className="h-3.5 w-3.5 mr-1" />
            Apply Changes & Regenerate Campaign
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
