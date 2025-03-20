import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import { OpenAIConfig } from "@/lib/openai";
import { Message } from "@/components/ChatWindow";
import { saveCampaignToLibrary } from "@/lib/campaignStorage";

export function useCampaignRegeneration(
  openAIConfig: OpenAIConfig,
  lastInput: CampaignInput | null,
  generatedCampaign: GeneratedCampaign | null,
  setGeneratedCampaign: React.Dispatch<React.SetStateAction<GeneratedCampaign | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsRegenerating: React.Dispatch<React.SetStateAction<boolean>>,
  scrollToCampaign: () => void
) {
  const isRegenerating = false;

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
        timestamp: Date.now(),
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
        
        throw new Error("Full campaign regeneration should be handled by the parent hook");
      }
      
      const confirmationMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: targetSection
          ? `I've updated the ${getSectionDisplayName(targetSection)} based on your feedback. Is there anything else you'd like to refine?`
          : `I've regenerated the campaign based on your feedback. The new campaign is called "${updatedCampaign.campaignName}" with the key message: "${updatedCampaign.keyMessage}". Is there anything else you'd like to refine?`,
        timestamp: Date.now(),
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

  return {
    handleRegenerateCampaign,
    getSectionDisplayName,
  };
}
