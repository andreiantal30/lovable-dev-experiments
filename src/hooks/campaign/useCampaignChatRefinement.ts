
import { useState } from "react";
import { OpenAIConfig } from "@/lib/openai";
import { GeneratedCampaign, CampaignInput } from "@/lib/generateCampaign";
import { toast } from "sonner";
import { Message } from "@/components/ChatWindow";
import { generateWithOpenAI } from "@/lib/openai";

export function useCampaignChatRefinement(
  openAIConfig: OpenAIConfig,
  lastInput: CampaignInput | null,
  generatedCampaign: GeneratedCampaign | null,
  setGeneratedCampaign: (campaign: GeneratedCampaign | null) => void,
  messages: Message[],
  scrollToCampaign: () => void
) {
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  const applyChangesAndRegenerateCampaign = async (): Promise<boolean> => {
    if (!openAIConfig.apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return false;
    }

    if (!generatedCampaign || !lastInput) {
      toast.error("No campaign to refine");
      return false;
    }

    if (messages.length <= 1) {
      toast.info("No chat refinements to apply");
      return false;
    }

    setIsApplyingChanges(true);

    try {
      // Create a prompt to regenerate the campaign based on chat history
      const relevantMessages = messages.filter(m => 
        m.role === "user" || m.role === "assistant"
      ).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

      const originalCampaignFormat = `
Original Campaign:
- Campaign Name: ${generatedCampaign.campaignName}
- Key Message: ${generatedCampaign.keyMessage}
- Creative Strategy: ${generatedCampaign.creativeStrategy.join(", ")}
- Execution Plan: ${generatedCampaign.executionPlan.join(", ")}
- Viral Element: ${generatedCampaign.viralElement || "N/A"}
- Call to Action: ${generatedCampaign.callToAction || "N/A"}
- Emotional Appeal: ${Array.isArray(generatedCampaign.emotionalAppeal) ? generatedCampaign.emotionalAppeal.join(", ") : "N/A"}
- Expected Outcomes: ${generatedCampaign.expectedOutcomes.join(", ")}
      `;

      const prompt = `
You are a campaign generator. You've created an original marketing campaign, and then had a chat conversation where refinements and improvements were discussed.

${originalCampaignFormat}

Chat History (containing refinements):
${relevantMessages}

Based on the original campaign and all the refinements and improvements discussed in the chat, create a new, improved version of the campaign. 

Maintain the same structure but incorporate all the refinements. Output in JSON format:

\`\`\`json
{
  "campaignName": "New Campaign Name",
  "keyMessage": "New Key Message",
  "creativeStrategy": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "executionPlan": ["Execution 1", "Execution 2", "Execution 3", "Execution 4", "Execution 5"],
  "viralElement": "New Viral Element",
  "callToAction": "New Call to Action",
  "emotionalAppeal": ["Appeal 1", "Appeal 2", "Appeal 3"],
  "expectedOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3", "Outcome 4"]
}
\`\`\`

Important: Do not invent new information that wasn't discussed. Only incorporate refinements from the chat history, and keep everything else from the original campaign.
      `;

      const response = await generateWithOpenAI(prompt, openAIConfig);

      // Extract JSON from response
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
      const match = response.match(jsonRegex);
      
      let jsonContent;
      if (match && match[1]) {
        jsonContent = match[1].trim();
      } else {
        jsonContent = response.trim();
      }

      // Parse the JSON content
      const refinedCampaign = JSON.parse(jsonContent);

      // Create the new campaign by combining the refined content with the original reference campaigns
      const newCampaign: GeneratedCampaign = {
        ...refinedCampaign,
        referenceCampaigns: generatedCampaign.referenceCampaigns,
        storytelling: generatedCampaign.storytelling
      };

      // Update the campaign
      setGeneratedCampaign(newCampaign);
      scrollToCampaign();
      
      toast.success("Campaign updated with chat refinements");
      return true;
    } catch (error) {
      console.error("Error applying changes and regenerating campaign:", error);
      toast.error("Failed to apply changes and regenerate campaign");
      return false;
    } finally {
      setIsApplyingChanges(false);
    }
  };

  return {
    isApplyingChanges,
    applyChangesAndRegenerateCampaign
  };
}
