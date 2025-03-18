
import { useState } from "react";
import CampaignForm from "@/components/CampaignForm";
import CampaignResult from "@/components/CampaignResult";
import { CampaignInput, GeneratedCampaign, generateCampaign } from "@/lib/generateCampaign";
import TransitionElement from "@/components/TransitionElement";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { OpenAIConfig, defaultOpenAIConfig } from "@/lib/openai";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>(() => {
    // Try to get the API key from localStorage
    const savedConfig = localStorage.getItem('openai-config');
    return savedConfig ? JSON.parse(savedConfig) : defaultOpenAIConfig;
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(!openAIConfig.apiKey);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save the config to localStorage
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
    
    try {
      const campaign = await generateCampaign(input, openAIConfig);
      setGeneratedCampaign(campaign);
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnother = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setGeneratedCampaign(null);
  };

  const handleChangeApiKey = () => {
    setShowApiKeyInput(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
      <ThemeToggle />
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <header className="text-center mb-12 md:mb-16">
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
              <CampaignResult campaign={generatedCampaign} onGenerateAnother={handleGenerateAnother} />
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
        
        {!generatedCampaign && !showApiKeyInput && (
          <div className="mt-20">
            <TransitionElement animation="slide-up" delay={600}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm border border-border rounded-xl p-6 text-center shadow-subtle hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">OpenAI Powered</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate cutting-edge campaign ideas using OpenAI's powerful language models
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm border border-border rounded-xl p-6 text-center shadow-subtle hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Targeted Impact</h3>
                  <p className="text-muted-foreground text-sm">
                    Craft campaigns precisely tailored to your specific audience and objectives
                  </p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm border border-border rounded-xl p-6 text-center shadow-subtle hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Rapid Ideation</h3>
                  <p className="text-muted-foreground text-sm">
                    Get complete campaign concepts in seconds, not days or weeks
                  </p>
                </div>
              </div>
            </TransitionElement>
          </div>
        )}
        
        {/* Add How It Works section */}
        {!generatedCampaign && !showApiKeyInput && <HowItWorks />}
        
        <footer className="mt-20 md:mt-32 text-center text-sm text-muted-foreground">
          <p>© 2023 Creative Campaign Generator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
