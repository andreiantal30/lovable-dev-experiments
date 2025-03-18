
import { useState } from "react";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { OpenAIConfig, defaultOpenAIConfig, generateWithOpenAI } from "@/lib/openai";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/components/ChatWindow";
import { CampaignFeedback } from "@/components/CampaignResult";

// Import refactored components
import Header from "@/components/IndexPage/Header";
import ApiKeyForm from "@/components/IndexPage/ApiKeyForm";
import CampaignSection from "@/components/IndexPage/CampaignSection";
import Footer from "@/components/IndexPage/Footer";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>(() => {
    const savedConfig = localStorage.getItem('openai-config');
    return savedConfig ? JSON.parse(savedConfig) : defaultOpenAIConfig;
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(!openAIConfig.apiKey);
  const [lastInput, setLastInput] = useState<CampaignInput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('openai-config', JSON.stringify(openAIConfig));
    setShowApiKeyInput(false);
    toast.success("API key saved successfully");
  };

  const handleGenerateCampaign = async (input: CampaignInput) => {
    if (!openAIConfig.apiKey) {
      setShowApiKeyInput(true);
      toast.error("Please enter your OpenAI API key first");
      return;
    }

    setIsGenerating(true);
    setLastInput(input);
    
    try {
      const campaign = await generateCampaign(input, openAIConfig);
      setGeneratedCampaign(campaign);
      
      initializeChat(campaign, input);
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate campaign");
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

  const handleSendMessage = async (content: string) => {
    if (isProcessingMessage) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessingMessage(true);
    
    try {
      let context = '';
      if (generatedCampaign && lastInput) {
        context = `
        Current Campaign Details:
        Brand: ${lastInput.brand}
        Industry: ${lastInput.industry}
        Campaign Name: ${generatedCampaign.campaignName}
        Key Message: ${generatedCampaign.keyMessage}
        Creative Strategy: ${generatedCampaign.creativeStrategy.join(', ')}
        Execution Plan: ${generatedCampaign.executionPlan.join(', ')}
        
        User's Question or Feedback: ${content}
        
        Respond as a helpful creative campaign assistant. Provide specific ideas for improvement if requested.
        `;
      }
      
      const aiResponse = await generateWithOpenAI(context, openAIConfig);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Failed to get a response");
    } finally {
      setIsProcessingMessage(false);
    }
  };

  const handleGenerateAnother = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setGeneratedCampaign(null);
    setIsChatActive(false);
    setMessages([]);
  };

  const handleChangeApiKey = () => {
    setShowApiKeyInput(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
      <ThemeToggle />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <Header 
          apiKey={openAIConfig.apiKey} 
          onChangeApiKey={handleChangeApiKey} 
        />
        
        {showApiKeyInput && (
          <ApiKeyForm
            openAIConfig={openAIConfig}
            setOpenAIConfig={setOpenAIConfig}
            onSubmit={handleApiKeySubmit}
            hasGeneratedCampaign={!!generatedCampaign}
            onCancel={generatedCampaign ? () => setShowApiKeyInput(false) : undefined}
          />
        )}
        
        {!showApiKeyInput && (
          <CampaignSection
            generatedCampaign={generatedCampaign}
            isGenerating={isGenerating}
            onGenerateCampaign={handleGenerateCampaign}
            onGenerateAnother={handleGenerateAnother}
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessingMessage={isProcessingMessage}
            isChatActive={isChatActive}
            openAIConfig={openAIConfig}
            onRefine={handleRefineCampaign}
            isRefining={isRefining}
          />
        )}
        
        <Footer />
      </div>
    </div>
  );
};

export default Index;
