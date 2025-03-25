
import { toast } from "sonner";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import { OpenAIConfig } from "@/lib/openai";
import { saveCampaignToLibrary } from "@/lib/campaignStorage";
import { CampaignFeedbackData } from "@/components/FeedbackSystem";
import { formatFeedbackForPrompt } from "@/utils/formatCampaignForPrompt";
import { saveFeedbackData } from "@/lib/feedbackStorage";

export function useCampaignRefinement(
  openAIConfig: OpenAIConfig,
  lastInput: CampaignInput | null,
  generatedCampaign: GeneratedCampaign | null,
  setGeneratedCampaign: React.Dispatch<React.SetStateAction<GeneratedCampaign | null>>,
  setIsRefining: React.Dispatch<React.SetStateAction<boolean>>,
  scrollToCampaign: () => void
) {
  const handleRefineCampaign = async (feedback: CampaignFeedbackData) => {
    if (!lastInput) {
      toast.error("Cannot refine without original input");
      return;
    }

    setIsRefining(true);
    
    try {
      // Save feedback for future fine-tuning
      if (generatedCampaign) {
        await saveFeedbackData({
          campaignId: generatedCampaign.campaignName,
          feedback,
          input: lastInput
        });
      }
      
      // Format feedback for prompt enhancement
      const formattedFeedback = formatFeedbackForPrompt(feedback);
      
      const enhancedInput: CampaignInput = {
        ...lastInput,
        additionalConstraints: `
          Refine based on user feedback:
          ${formattedFeedback}

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

  return {
    handleRefineCampaign
  };
}
