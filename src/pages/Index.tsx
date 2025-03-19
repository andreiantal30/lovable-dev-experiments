
import { toast } from "sonner";
import { SidebarInset } from "@/components/ui/sidebar";
import CampaignSidebar from "@/components/CampaignSidebar";
import SidebarToggle from "@/components/SidebarToggle";
import ThemeToggle from "@/components/ThemeToggle";
import Header from "@/components/IndexPage/Header";
import Footer from "@/components/IndexPage/Footer";
import ApiKeyForm from "@/components/IndexPage/ApiKeyForm";
import CampaignSection from "@/components/IndexPage/CampaignSection";
import { useCampaignGeneration } from "@/hooks/useCampaignGeneration";
import { useOpenAIConfig } from "@/hooks/useOpenAIConfig";

const Index = () => {
  const {
    openAIConfig,
    setOpenAIConfig,
    showApiKeyInput,
    setShowApiKeyInput,
    handleApiKeySubmit,
    handleChangeApiKey,
    handleSendMessage: processMessage
  } = useOpenAIConfig();

  const {
    isGenerating,
    isRefining,
    isRegenerating,
    isApplyingChanges,
    generatedCampaign,
    lastInput,
    messages,
    isChatActive,
    isProcessingMessage,
    setIsProcessingMessage,
    handleGenerateCampaign,
    handleGenerateAnother,
    handleRefineCampaign,
    handleRegenerateCampaign,
    applyChangesAndRegenerateCampaign,
    setMessages,
    campaignResultRef
  } = useCampaignGeneration(openAIConfig);

  const onApiKeySubmit = (e: React.FormEvent) => {
    if (handleApiKeySubmit(e)) {
      toast.success("API key saved successfully");
    }
  };

  const onGenerateCampaign = async (input: any) => {
    if (!openAIConfig.apiKey) {
      setShowApiKeyInput(true);
      toast.error("Please enter your OpenAI API key first");
      return;
    }
    
    await handleGenerateCampaign(input);
  };

  const handleSendMessage = async (content: string) => {
    await processMessage(
      content, 
      setMessages, 
      setIsProcessingMessage, 
      isProcessingMessage,
      generatedCampaign,
      lastInput
    );
  };

  const handleCampaignSelect = (id: string) => {
    window.location.href = `/campaign/${id}`;
  };

  return (
    <>
      <CampaignSidebar onCampaignSelect={handleCampaignSelect} />
      <SidebarInset className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden relative">
        <SidebarToggle />
        <ThemeToggle />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <div className="mb-8">
            <Header 
              apiKey={openAIConfig.apiKey} 
              onChangeApiKey={handleChangeApiKey} 
            />
          </div>
          
          {showApiKeyInput && (
            <ApiKeyForm
              openAIConfig={openAIConfig}
              setOpenAIConfig={setOpenAIConfig}
              onSubmit={onApiKeySubmit}
              hasGeneratedCampaign={!!generatedCampaign}
              onCancel={generatedCampaign ? () => setShowApiKeyInput(false) : undefined}
            />
          )}
          
          {!showApiKeyInput && (
            <CampaignSection
              generatedCampaign={generatedCampaign}
              isGenerating={isGenerating}
              isRegenerating={isRegenerating || isApplyingChanges}
              onGenerateCampaign={onGenerateCampaign}
              onGenerateAnother={handleGenerateAnother}
              messages={messages}
              onSendMessage={handleSendMessage}
              onRegenerateCampaign={handleRegenerateCampaign}
              onApplyChangesAndRegenerate={applyChangesAndRegenerateCampaign}
              isProcessingMessage={isProcessingMessage}
              isChatActive={isChatActive}
              openAIConfig={openAIConfig}
              onRefine={handleRefineCampaign}
              isRefining={isRefining}
              lastInput={lastInput}
              campaignResultRef={campaignResultRef}
            />
          )}
          
          <Footer />
        </div>
      </SidebarInset>
    </>
  );
};

export default Index;
