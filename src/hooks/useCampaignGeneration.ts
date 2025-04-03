import { useState, useRef } from "react";
import { CampaignInput, GeneratedCampaign, generateCampaign, CampaignVersion } from "@/lib/generateCampaign";
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
  const [campaignVersions, setCampaignVersions] = useState<CampaignVersion[]>([]);

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

  const { handleRefineCampaign } = useCampaignRefinement(
    openAIConfig,
    lastInput,
    generatedCampaign,
    setGeneratedCampaign,
    setIsRefining,
    scrollToCampaign
  );

  const { handleRegenerateCampaign } = useCampaignRegeneration(
    openAIConfig,
    lastInput,
    generatedCampaign,
    setGeneratedCampaign,
    setMessages,
    setIsRegenerating,
    scrollToCampaign
  );

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

  const saveCampaignVersion = (tag: string) => {
    if (!generatedCampaign) return;

    const newVersion: CampaignVersion = {
      id: uuidv4(),
      versionTag: tag,
      timestamp: Date.now(),
      campaign: { ...generatedCampaign }
    };

    setCampaignVersions(prev => [...prev, newVersion]);
  };

  const loadCampaignVersion = (version: CampaignVersion) => {
    setGeneratedCampaign({ ...version.campaign });
  };

  const handleGenerateCampaign = async (input: CampaignInput) => {
    if (!openAIConfig.apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return false;
    }

    setIsGenerating(true);
    setLastInput(input);

    try {
      const campaign = await generateCampaign(input, openAIConfig);

      if (campaign) {
        setCampaignVersions([{
          id: uuidv4(),
          versionTag: "original",
          timestamp: Date.now(),
          campaign: { ...campaign }
        }]);
      }

      setGeneratedCampaign(campaign);

      if (campaign && input.brand && input.industry) {
        const savedCampaign = saveCampaignToLibrary({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          campaign,
          brand: input.brand,
          industry: input.industry,
          favorite: false
        });

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
    setCampaignVersions([]);
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
    campaignResultRef,
    campaignVersions,
    saveCampaignVersion,
    loadCampaignVersion
  };
}