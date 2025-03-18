
import React from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignResult from "@/components/CampaignResult";
import ChatWindow, { Message } from "@/components/ChatWindow";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { OpenAIConfig } from "@/lib/openai";
import { CampaignFeedback } from "@/components/CampaignResult";
import HowItWorks from "@/components/HowItWorks";
import Plans from "@/components/Plans";

interface CampaignSectionProps {
  generatedCampaign: GeneratedCampaign | null;
  isGenerating: boolean;
  onGenerateCampaign: (input: CampaignInput) => Promise<void>;
  onGenerateAnother: () => void;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isProcessingMessage: boolean;
  isChatActive: boolean;
  openAIConfig: OpenAIConfig;
  onRefine: (feedback: CampaignFeedback) => Promise<void>;
  isRefining: boolean;
}

const CampaignSection = ({
  generatedCampaign,
  isGenerating,
  onGenerateCampaign,
  onGenerateAnother,
  messages,
  onSendMessage,
  isProcessingMessage,
  isChatActive,
  openAIConfig,
  onRefine,
  isRefining
}: CampaignSectionProps) => {
  return (
    <>
      {!generatedCampaign ? (
        <CampaignForm onSubmit={onGenerateCampaign} isGenerating={isGenerating} />
      ) : (
        <div className="space-y-12">
          <CampaignResult 
            campaign={generatedCampaign} 
            onGenerateAnother={onGenerateAnother}
            showFeedbackForm={!isChatActive}
            onRefine={onRefine}
          />
          
          {isChatActive && (
            <TransitionElement animation="slide-up" delay={100}>
              <ChatWindow 
                messages={messages}
                onSendMessage={onSendMessage}
                isLoading={isProcessingMessage}
                openAIConfig={openAIConfig}
              />
            </TransitionElement>
          )}
        </div>
      )}
      
      {generatedCampaign && (
        <div className="mt-8 text-center">
          <TransitionElement animation="fade" delay={700}>
            <button
              onClick={onGenerateAnother}
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 text-sm mx-auto"
            >
              Create a new campaign
            </button>
          </TransitionElement>
        </div>
      )}
      
      {!generatedCampaign && <HowItWorks />}
      {!generatedCampaign && <Plans />}
    </>
  );
};

export default CampaignSection;
