
import { toast } from "sonner";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import { OpenAIConfig } from "@/lib/openai";
import { saveCampaignToLibrary } from "@/lib/campaignStorage";
import { CampaignFeedback } from "@/components/CampaignResult";

export function useCampaignRefinement(
  openAIConfig: OpenAIConfig,
  lastInput: CampaignInput | null,
  generatedCampaign: GeneratedCampaign | null,
  setGeneratedCampaign: React.Dispatch<React.SetStateAction<GeneratedCampaign | null>>,
  setIsRefining: React.Dispatch<React.SetStateAction<boolean>>,
  scrollToCampaign: () => void
) {
  const getFeedbackText = (rating: number): string => {
    if (rating === 1) return "Positive";
    if (rating === -1) return "Negative";
    return "Neutral";
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

  return {
    handleRefineCampaign,
    getFeedbackText
  };
}
