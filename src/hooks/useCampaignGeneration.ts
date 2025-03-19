import { useState, useRef } from "react";
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const campaignResultRef = useRef<HTMLDivElement | null>(null);

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
      
      scrollToCampaign();
      
      toast.success("Campaign has been refined based on your feedback!");
    } catch (error) {
      console.error("Error refining campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to refine campaign");
    } finally {
      setIsRefining(false);
    }
  };

  const handleRegenerateCampaign = async (userFeedback: string, targetSection?: string) => {
    if (!lastInput || !generatedCampaign) {
      toast.error("Cannot regenerate without original input and campaign");
      return false;
    }

    setIsRegenerating(true);
    
    try {
      const systemMessage = targetSection 
        ? `Regenerating the ${getSectionDisplayName(targetSection)} based on your feedback...`
        : "Regenerating campaign based on your feedback...";
        
      const regeneratingMessage: Message = {
        id: uuidv4(),
        role: "system",
        content: systemMessage,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, regeneratingMessage]);
      
      const updatedCampaign = { ...generatedCampaign };
      
      if (targetSection) {
        const result = await regenerateTargetedSection(
          targetSection, 
          userFeedback, 
          generatedCampaign, 
          lastInput
        );
        
        if (targetSection === "campaignName") {
          updatedCampaign.campaignName = result;
        } else if (targetSection === "keyMessage") {
          updatedCampaign.keyMessage = result;
        } else if (targetSection === "creativeStrategy") {
          try {
            const parsedResult = JSON.parse(result);
            updatedCampaign.creativeStrategy = Array.isArray(parsedResult) ? parsedResult : [result];
          } catch {
            updatedCampaign.creativeStrategy = result.includes('\n') 
              ? result.split('\n').filter(line => line.trim()) 
              : [result];
          }
        } else if (targetSection === "executionPlan") {
          try {
            const parsedResult = JSON.parse(result);
            updatedCampaign.executionPlan = Array.isArray(parsedResult) ? parsedResult : [result];
          } catch {
            updatedCampaign.executionPlan = result.includes('\n') 
              ? result.split('\n').filter(line => line.trim()) 
              : [result];
          }
        } else if (targetSection === "viralElement") {
          if ('viralElement' in updatedCampaign) {
            updatedCampaign.viralElement = result;
          } else {
            updatedCampaign.viralHook = result;
          }
        } else if (targetSection === "callToAction") {
          if ('callToAction' in updatedCampaign) {
            updatedCampaign.callToAction = result;
          } else {
            updatedCampaign.consumerInteraction = result;
          }
        } else if (targetSection === "emotionalAppeal") {
          try {
            const parsedResult = JSON.parse(result);
            if ('emotionalAppeal' in updatedCampaign) {
              updatedCampaign.emotionalAppeal = Array.isArray(parsedResult) ? parsedResult : [result];
            } else {
              const message = "Emotional appeal was updated but will be applied on next generation";
              toast.info(message);
              console.log("Emotional appeal update:", result);
            }
          } catch {
            if ('emotionalAppeal' in updatedCampaign) {
              updatedCampaign.emotionalAppeal = result.includes('\n') 
                ? result.split('\n').filter(line => line.trim()) 
                : [result];
            }
          }
        }
        
        setGeneratedCampaign(updatedCampaign);
      } else {
        const enhancedInput: CampaignInput = {
          ...lastInput,
          additionalConstraints: `
            Regenerate the campaign based on this user feedback:
            "${userFeedback}"
            
            Previous campaign name: ${generatedCampaign.campaignName}
            Previous key message: ${generatedCampaign.keyMessage}
          `
        };
        
        const regeneratedCampaign = await generateCampaign(enhancedInput, openAIConfig);
        setGeneratedCampaign(regeneratedCampaign);
      }
      
      const confirmationMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: targetSection
          ? `I've updated the ${getSectionDisplayName(targetSection)} based on your feedback. Is there anything else you'd like to refine?`
          : `I've regenerated the campaign based on your feedback. The new campaign is called "${updatedCampaign.campaignName}" with the key message: "${updatedCampaign.keyMessage}". Is there anything else you'd like to refine?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev.filter(msg => msg.id !== regeneratingMessage.id), confirmationMessage]);
      
      if (lastInput.brand && lastInput.industry) {
        const savedCampaign = saveCampaignToLibrary(
          updatedCampaign, 
          lastInput.brand, 
          lastInput.industry
        );
        if (savedCampaign) {
          toast.success(targetSection 
            ? `Updated campaign ${getSectionDisplayName(targetSection)} saved to your library` 
            : "Regenerated campaign saved to your library"
          );
        }
      }
      
      scrollToCampaign();
      
      return true;
    } catch (error) {
      console.error("Error regenerating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to regenerate campaign");
      return false;
    } finally {
      setIsRegenerating(false);
    }
  };

  const regenerateTargetedSection = async (
    section: string,
    userFeedback: string,
    currentCampaign: GeneratedCampaign,
    input: CampaignInput
  ): Promise<string> => {
    const prompt = `
      You are an expert marketing consultant focusing on regenerating just ONE part of a marketing campaign.
      Please ONLY regenerate the ${getSectionDisplayName(section)} based on this feedback: "${userFeedback}"
      
      Original campaign details:
      - Brand: ${input.brand}
      - Industry: ${input.industry}
      - Campaign Name: ${currentCampaign.campaignName}
      - Key Message: ${currentCampaign.keyMessage}
      - Target Audience: ${input.targetAudience?.join(', ')}
      - Objectives: ${input.objectives?.join(', ')}
      
      Focus specifically on creating a new ${getSectionDisplayName(section)} that addresses this feedback.
      Respond with ONLY the new content for ${getSectionDisplayName(section)} without any additional explanations.
    `;
    
    try {
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: openAIConfig.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      
      if (!result.ok) {
        const error = await result.json();
        throw new Error(error.error?.message || `Error generating ${section}`);
      }
      
      const data = await result.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Error regenerating ${section}:`, error);
      throw error;
    }
  };

  const getSectionDisplayName = (section: string): string => {
    const sectionNames: Record<string, string> = {
      campaignName: "Campaign Name",
      keyMessage: "Key Message",
      creativeStrategy: "Creative Strategy",
      executionPlan: "Execution Plan",
      viralElement: "Viral Element",
      callToAction: "Call to Action",
      emotionalAppeal: "Emotional Appeal"
    };
    
    return sectionNames[section] || section;
  };

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

  const getFeedbackText = (rating: number): string => {
    if (rating === 1) return "Positive";
    if (rating === -1) return "Negative";
    return "Neutral";
  };

  return {
    isGenerating,
    isRefining,
    isRegenerating,
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
    setMessages,
    campaignResultRef
  };
}
