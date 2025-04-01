
import React, { useEffect } from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignResult, { CampaignFeedback } from "@/components/CampaignResult";
import ChatWindow, { Message } from "@/components/ChatWindow";
import { CampaignInput, GeneratedCampaign, CampaignVersion } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { OpenAIConfig } from "@/lib/openai";
import HowItWorks from "@/components/HowItWorks";
import Plans from "@/components/Plans";
import { Link } from "react-router-dom";
import { ChevronDown, Library, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CampaignVersions from "@/components/CampaignVersions";

interface CampaignSectionProps {
  generatedCampaign: GeneratedCampaign | null;
  isGenerating: boolean;
  isRegenerating?: boolean;
  onGenerateCampaign: (input: CampaignInput) => Promise<void>;
  onGenerateAnother: () => void;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onRegenerateCampaign?: (feedback: string, targetSection?: string) => Promise<boolean>;
  onApplyChangesAndRegenerate?: () => Promise<boolean>;
  isProcessingMessage: boolean;
  isChatActive: boolean;
  openAIConfig: OpenAIConfig;
  onRefine: (feedback: CampaignFeedback) => Promise<void>;
  isRefining: boolean;
  lastInput: CampaignInput | null;
  campaignResultRef: React.RefObject<HTMLDivElement>;
  chatMemory?: {
    pastInteractions: Message[];
    userPreferences: Record<string, any>;
  };
  insightPrompt?: string | null;
  campaignVersions?: CampaignVersion[];
  onSaveCampaignVersion?: (tag: string) => void;
  onLoadCampaignVersion?: (version: CampaignVersion) => void;
}

const CampaignSection = ({
  generatedCampaign,
  isGenerating,
  isRegenerating,
  onGenerateCampaign,
  onGenerateAnother,
  messages,
  onSendMessage,
  onRegenerateCampaign,
  onApplyChangesAndRegenerate,
  isProcessingMessage,
  isChatActive,
  openAIConfig,
  onRefine,
  isRefining,
  lastInput,
  campaignResultRef,
  chatMemory,
  insightPrompt,
  campaignVersions = [],
  onSaveCampaignVersion,
  onLoadCampaignVersion
}: CampaignSectionProps) => {
  const scrollArrowRef = React.useRef<HTMLDivElement>(null);
  const mainScrollArrowRef = React.useRef<HTMLDivElement>(null);
  
  // Effect to scroll to campaign result when generated
  useEffect(() => {
    if (generatedCampaign && campaignResultRef.current) {
      // Scroll to the campaign result with smooth behavior
      setTimeout(() => {
        campaignResultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [generatedCampaign, campaignResultRef]);
  
  // Effect to hide arrow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (scrollArrowRef.current && window.scrollY > 100) {
        scrollArrowRef.current.classList.add('opacity-0');
      }
      
      if (mainScrollArrowRef.current && window.scrollY > 100) {
        mainScrollArrowRef.current.classList.add('opacity-0');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToContent = () => {
    if (!generatedCampaign) {
      // Find the HowItWorks section and scroll to it
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <>
      {!generatedCampaign ? (
        <div className="flex flex-col w-full">
          {insightPrompt && (
            <TransitionElement animation="fade" className="mb-6">
              <Alert className="bg-primary/10 border-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
                <AlertDescription className="flex items-center">
                  {insightPrompt}
                </AlertDescription>
              </Alert>
            </TransitionElement>
          )}
          
          <div className="flex justify-center w-full">
            <CampaignForm onSubmit={onGenerateCampaign} isGenerating={isGenerating} />
          </div>
          
          {/* Main page scroll down arrow */}
          <div 
            ref={mainScrollArrowRef}
            className="flex justify-center mt-8 mb-8 transition-opacity duration-500"
            onClick={scrollToContent}
          >
            <div className="animate-bounce-fade text-muted-foreground cursor-pointer hover:text-primary transition-colors duration-300">
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12" ref={campaignResultRef} id="generated-campaign">
          {/* Version Management */}
          {onSaveCampaignVersion && onLoadCampaignVersion && (
            <div className="flex justify-end">
              <div className="flex gap-2">
                <CampaignVersions
                  currentCampaign={generatedCampaign}
                  versions={campaignVersions}
                  onSaveVersion={onSaveCampaignVersion}
                  onLoadVersion={onLoadCampaignVersion}
                />
              </div>
            </div>
          )}
          
          <div className={isRefining || isRegenerating ? "opacity-50 pointer-events-none" : ""}>
            <CampaignResult 
              campaign={generatedCampaign} 
              onGenerateAnother={onGenerateAnother}
              showFeedbackForm={!isChatActive}
              onRefine={onRefine}
            />
          </div>
          
          {/* Scroll down arrow */}
          <div 
            ref={scrollArrowRef}
            className="flex justify-center mt-2 mb-8 transition-opacity duration-500"
          >
            <div className="animate-bounce-fade text-muted-foreground">
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
          
          {isChatActive && (
            <TransitionElement animation="slide-up" delay={100}>
              <ChatWindow 
                messages={messages}
                onSendMessage={onSendMessage}
                onRegenerateCampaign={onRegenerateCampaign}
                onApplyChangesAndRegenerate={onApplyChangesAndRegenerate}
                isLoading={isProcessingMessage}
                openAIConfig={openAIConfig}
                persona={lastInput?.persona}
                chatMemory={chatMemory}
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
      
      {!generatedCampaign && <HowItWorks id="how-it-works" />}
      {!generatedCampaign && <Plans />}
    </>
  );
};

export default CampaignSection;
