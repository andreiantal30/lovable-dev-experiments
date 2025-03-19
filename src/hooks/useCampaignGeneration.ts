
import { useState, useRef } from "react";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import { OpenAIConfig } from "@/lib/openai";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/components/ChatWindow";
import { saveCampaignToLibrary } from "@/lib/campaignStorage";
import { CampaignFeedback } from "@/components/CampaignResult";
import { useCampaignChat } from "./campaign/useCampaignChat";
import { useCampaignRefinement } from "./campaign/useCampaignRefinement";
import { useCampaignRegeneration } from "./campaign/useCampaignRegeneration";
import { useCampaignChatRefinement } from "./campaign/useCampaignChatRefinement";

export function useCampaignGeneration(openAIConfig: OpenAIConfig) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const campaignResultRef = useRef<HTMLDivElement | null>(null);

  // Import functionality from the separated hooks
  const { 
    messages,
    setMessages,
    isChatActive,
    setIsChatActive,
    isProcessingMessage,
    setIsProcessingMessage,
    initializeChat
  } = useCampaignChat();

  const scrollToCampaign = () => {
    if (campaignResultRef.current) {
      campaignResultRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      const campaignElement = document.getElementById('generated-campaign');
      if (campaignElement) {
        campaignElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  // Import refinement functionality
  const { handleRefineCampaign } = useCampaignRefinement(
    openAIConfig,
    lastInput,
    generatedCampaign,
    setGeneratedCampaign,
    setIsRefining,
    scrollToCampaign
  );

  // Import regeneration functionality 
  const { handleRegenerateCampaign } = useCampaignRegeneration(
    openAIConfig,
    lastInput,
    generatedCampaign,
    setGeneratedCampaign,
    setMessages,
    setIsRegenerating,
    scrollToCampaign
  );

  // Import chat refinement functionality
  const { 
    isApplyingChanges,
    applyChangesAndRegenerateCampaign 
  } = useCampaignChatRefinement(
    openAIConfig,
    lastInput,
    generatedCampaign,
    setGeneratedCampaign,
    messages,
    scrollToCampaign
  );

  const handleGenerateCampaign = async (input: CampaignInput) => {
    if (!openAIConfig.apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return false;
    }

    setIsGenerating(true);
    setLastInput(input);
    
    try {
      const campaign = await generateCampaign(input, openAIConfig);
      setGeneratedCampaign(campaign);
      
      if (campaign && input.brand && input.industry) {
        const savedCampaign = saveCampaignToLibrary(campaign, input.brand, input.industry);
        if (savedCampaign) {
          toast.success("Campaign automatically saved to your library");
        }
      }
      
      initializeChat(campaign, input);
      return true;
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate campaign");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnother = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setGeneratedCampaign(null);
    setIsChatActive(false);
    setMessages([]);
  };

  return {
    isGenerating,
    isRefining,
    isRegenerating,
    isApplyingChanges,
    generatedCampaign,
    lastInput,
    messages,
    isChatActive,
    isProcessingMessage,
    setIsProcessingMessage,
    handleGenerateCampaign,
    handleGenerateAnother,
    handleRefineCampaign,
    handleRegenerateCampaign,
    applyChangesAndRegenerateCampaign,
    setMessages,
    campaignResultRef
  };
}
