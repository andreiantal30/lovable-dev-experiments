
import React from "react";
import CampaignForm from "@/components/CampaignForm";
import EnhancedCampaignResult from "@/components/EnhancedCampaignResult";
import ChatWindow, { Message } from "@/components/ChatWindow";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { OpenAIConfig } from "@/lib/openai";
import HowItWorks from "@/components/HowItWorks";
import Plans from "@/components/Plans";
import { Link } from "react-router-dom";
import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignFeedback } from "@/components/CampaignResult";

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
  lastInput: CampaignInput | null;
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
  isRefining,
  lastInput
}: CampaignSectionProps) => {
  return (
    <>
      {!generatedCampaign ? (
        <div className="flex flex-col w-full">
          <div className="flex justify-center w-full">
            <CampaignForm onSubmit={onGenerateCampaign} isGenerating={isGenerating} />
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <EnhancedCampaignResult 
            campaign={generatedCampaign} 
            onGenerateAnother={onGenerateAnother}
            showFeedbackForm={!isChatActive}
            onRefine={onRefine}
            brandName={lastInput?.brand}
            industryName={lastInput?.industry}
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGenerateAnother}
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 text-sm"
              >
                Create a new campaign
              </button>
              
              <Link to="/library" className="text-muted-foreground hover:text-foreground text-sm">
                <span className="flex items-center">
                  <Library className="mr-1.5 h-3.5 w-3.5" />
                  Browse saved campaigns
                </span>
              </Link>
            </div>
          </TransitionElement>
        </div>
      )}
      
      {!generatedCampaign && <HowItWorks />}
      {!generatedCampaign && <Plans />}
    </>
  );
};

export default CampaignSection;
