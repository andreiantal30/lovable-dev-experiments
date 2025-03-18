
import { useState } from "react";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import { OpenAIConfig } from "@/lib/openai";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/components/ChatWindow";
import { saveCampaignToLibrary } from "@/lib/campaignStorage";
import { CampaignFeedback } from "@/components/CampaignResult";

export function useCampaignGeneration(openAIConfig: OpenAIConfig) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

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
      
      // Automatically save the campaign to the library
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

  const initializeChat = (campaign: GeneratedCampaign, input: CampaignInput) => {
    const initialMessages: Message[] = [
      {
        id: uuidv4(),
        role: "system",
        content: `I've created a campaign for ${input.brand} in the ${input.industry} industry. You can ask me questions about it or request refinements.`,
        timestamp: new Date(),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: `I've generated a creative campaign called "${campaign.campaignName}" for ${input.brand}. The key message is: "${campaign.keyMessage}". What aspects would you like to refine or discuss further?`,
        timestamp: new Date(),
      }
    ];
    
    setMessages(initialMessages);
    setIsChatActive(true);
  };

  const handleGenerateAnother = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setGeneratedCampaign(null);
    setIsChatActive(false);
    setMessages([]);
  };

  const handleRefineCampaign = async (feedback: CampaignFeedback) => {
    if (!lastInput) {
      toast.error("Cannot refine without original input");
      return;
    }

    setIsRefining(true);
    
    try {
      const enhancedInput: CampaignInput = {
        ...lastInput,
        additionalConstraints: `
          Refine based on user feedback:
          Overall rating: ${feedback.overallRating}/5
          Campaign Name rating: ${getFeedbackText(feedback.elementRatings.campaignName)}
          Key Message rating: ${getFeedbackText(feedback.elementRatings.keyMessage)}
          Creative Strategy rating: ${getFeedbackText(feedback.elementRatings.creativeStrategy)}
          Execution Plan rating: ${getFeedbackText(feedback.elementRatings.executionPlan)}
          User comments: ${feedback.comments || "No specific comments"}

          Previous campaign name: ${generatedCampaign?.campaignName}
          Previous key message: ${generatedCampaign?.keyMessage}
        `
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refinedCampaign = await generateCampaign(enhancedInput, openAIConfig);
      setGeneratedCampaign(refinedCampaign);
      
      // Automatically save the refined campaign to the library
      if (refinedCampaign && lastInput.brand && lastInput.industry) {
        const savedCampaign = saveCampaignToLibrary(
          refinedCampaign, 
          lastInput.brand, 
          lastInput.industry
        );
        if (savedCampaign) {
          toast.success("Refined campaign saved to your library");
        }
      }
      
      toast.success("Campaign has been refined based on your feedback!");
    } catch (error) {
      console.error("Error refining campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refine campaign");
    } finally {
      setIsRefining(false);
    }
  };

  const getFeedbackText = (rating: number): string => {
    if (rating === 1) return "Positive";
    if (rating === -1) return "Negative";
    return "Neutral";
  };

  return {
    isGenerating,
    isRefining,
    generatedCampaign,
    lastInput,
    messages,
    isChatActive,
    isProcessingMessage,
    setIsProcessingMessage,
    handleGenerateCampaign,
    handleGenerateAnother,
    handleRefineCampaign,
    setMessages
  };
}
