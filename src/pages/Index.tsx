import { useState } from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignResult from "@/components/CampaignResult";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { Sparkles, Database } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { OpenAIConfig, defaultOpenAIConfig, generateWithOpenAI } from "@/lib/openai";
import HowItWorks from "@/components/HowItWorks";
import Plans from "@/components/Plans";
import { CampaignFeedback } from "@/components/CampaignResult";
import ChatWindow, { Message } from "@/components/ChatWindow";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
        <header className="text-center mb-12 md:mb-16 relative">
          <div className="absolute right-0 top-0">
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <Link to="/campaign-manager">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Campaign Database</span>
                <span className="sm:hidden">Database</span>
              </Link>
            </Button>
          </div>
          
          <TransitionElement animation="slide-down">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>AI-Powered Creative Campaign Generator</span>
            </div>
          </TransitionElement>
          
          <TransitionElement animation="slide-down" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
              Transform Ideas into <br className="hidden md:block" />
              <span className="text-primary">Award-Winning Campaigns</span>
            </h1>
          </TransitionElement>
          
          <TransitionElement animation="slide-down" delay={200}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Leverage OpenAI's GPT to generate creative campaign concepts inspired by  
              previous award-winning advertising campaigns.
            </p>
          </TransitionElement>

          {openAIConfig.apiKey && (
            <TransitionElement animation="slide-down" delay={250}>
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleChangeApiKey}
                  className="text-sm text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Change OpenAI API key
                </button>
              </div>
            </TransitionElement>
          )}
        </header>
        
        {showApiKeyInput && (
          <TransitionElement animation="fade">
            <div className="max-w-md mx-auto mb-10 bg-white/70 dark:bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 shadow-subtle">
              <h2 className="text-lg font-medium mb-3">Enter your OpenAI API Key</h2>
              <form onSubmit={handleApiKeySubmit}>
                <div className="space-y-1.5 mb-4">
                  <label htmlFor="apiKey" className="text-sm font-medium">
                    API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={openAIConfig.apiKey}
                    onChange={(e) => setOpenAIConfig({...openAIConfig, apiKey: e.target.value})}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border rounded-md bg-white/90 dark:bg-gray-800/60"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>

                <div className="space-y-1.5 mb-4">
                  <label htmlFor="model" className="text-sm font-medium">
                    OpenAI Model
                  </label>
                  <select
                    id="model"
                    value={openAIConfig.model}
                    onChange={(e) => setOpenAIConfig({...openAIConfig, model: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-white/90 dark:bg-gray-800/60"
                  >
                    <option value="gpt-4o">GPT-4o (Best quality)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Faster, cheaper)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest, cheapest)</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  {generatedCampaign && (
                    <button
                      type="button"
                      onClick={() => setShowApiKeyInput(false)}
                      className="mr-2 px-3 py-1.5 text-sm border rounded-md"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    Save API Key
                  </button>
                </div>
              </form>
            </div>
          </TransitionElement>
        )}
        
        {!showApiKeyInput && (
          <>
            {!generatedCampaign ? (
              <CampaignForm onSubmit={handleGenerateCampaign} isGenerating={isGenerating} />
            ) : (
              <div className="space-y-12">
                <CampaignResult 
                  campaign={generatedCampaign} 
                  onGenerateAnother={handleGenerateAnother}
                  showFeedbackForm={!isChatActive}
                  onRefine={handleRefineCampaign}
                />
                
                {isChatActive && (
                  <TransitionElement animation="slide-up" delay={100}>
                    <ChatWindow 
                      messages={messages}
                      onSendMessage={handleSendMessage}
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
                    onClick={handleGenerateAnother}
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 text-sm mx-auto"
                  >
                    Create a new campaign
                  </button>
                </TransitionElement>
              </div>
            )}
          </>
        )}
        
        {!generatedCampaign && !showApiKeyInput && <HowItWorks />}
        
        {!generatedCampaign && !showApiKeyInput && <Plans />}
        
        <footer className="mt-20 md:mt-32 text-center text-sm text-muted-foreground">
          <p>© 2023 Creative Campaign Generator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
