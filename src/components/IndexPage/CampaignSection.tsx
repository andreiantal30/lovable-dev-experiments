
import React, { useState, useEffect } from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignResult from "@/components/CampaignResult";
import ChatWindow, { Message } from "@/components/ChatWindow";
import { CampaignInput, GeneratedCampaign } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { OpenAIConfig } from "@/lib/openai";
import { CampaignFeedback } from "@/components/CampaignResult";
import HowItWorks from "@/components/HowItWorks";
import Plans from "@/components/Plans";
import TrendingTopics from "@/components/TrendingTopics";
import { getTrendingTopics, TrendData } from "@/lib/trendMonitor";

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
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");

  // Fetch trends when the industry changes
  useEffect(() => {
    if (selectedIndustry) {
      fetchTrends(selectedIndustry);
    }
  }, [selectedIndustry]);

  const fetchTrends = async (industry: string) => {
    setIsLoadingTrends(true);
    try {
      const trendData = await getTrendingTopics(industry);
      setTrends(trendData);
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleFormIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
  };

  const handleSelectTrend = (trend: TrendData) => {
    // Implement the logic to incorporate the trend into the campaign
    if (!isChatActive || !generatedCampaign) return;

    // If the chat is active and we have a campaign, send a message about the trend
    onSendMessage(`Can you incorporate the trending topic "${trend.keyword}" (${trend.description}) into the campaign?`);
  };

  return (
    <>
      {!generatedCampaign ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CampaignForm 
              onSubmit={onGenerateCampaign} 
              isGenerating={isGenerating} 
              onIndustryChange={handleFormIndustryChange}
            />
          </div>
          
          {selectedIndustry && (
            <div className="lg:col-span-1">
              <TrendingTopics 
                trends={trends} 
                isLoading={isLoadingTrends}
                className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg border border-border dark:border-gray-700/50 rounded-2xl shadow-subtle p-6"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <CampaignResult 
            campaign={generatedCampaign} 
            onGenerateAnother={onGenerateAnother}
            showFeedbackForm={!isChatActive}
            onRefine={onRefine}
            isRefining={isRefining}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {isChatActive && (
              <div className="lg:col-span-3">
                <TransitionElement animation="slide-up" delay={100}>
                  <ChatWindow 
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isLoading={isProcessingMessage}
                    openAIConfig={openAIConfig}
                  />
                </TransitionElement>
              </div>
            )}
            
            {selectedIndustry && (
              <div className="lg:col-span-1">
                <TransitionElement animation="fade" delay={200}>
                  <TrendingTopics 
                    trends={trends} 
                    isLoading={isLoadingTrends}
                    onSelectTrend={handleSelectTrend}
                    className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-lg border border-border dark:border-gray-700/50 rounded-2xl shadow-subtle p-6"
                  />
                </TransitionElement>
              </div>
            )}
          </div>
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
