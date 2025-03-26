
import { toast } from "sonner";
import { SidebarInset } from "@/components/ui/sidebar";
import CampaignSidebar from "@/components/CampaignSidebar";
import SidebarToggle from "@/components/SidebarToggle";
import ThemeToggle from "@/components/ThemeToggle";
import Header from "@/components/IndexPage/Header";
import Footer from "@/components/IndexPage/Footer";
import CampaignSection from "@/components/IndexPage/CampaignSection";
import { useCampaignGeneration } from "@/hooks/useCampaignGeneration";
import { useOpenAIConfig } from "@/hooks/useOpenAIConfig";
import ApiKeyForm from "@/components/IndexPage/ApiKeyForm";

const Index = () => {
  const {
    openAIConfig,
    setOpenAIConfig,
    showApiKeyInput,
    setShowApiKeyInput,
    handleApiKeySubmit,
    handleSendMessage: processMessage,
    chatMemory
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
      <SidebarInset className="bg-gradient-to-b from-[#0d0d15] to-[#111827] overflow-hidden relative">
        <SidebarToggle />
        <ThemeToggle />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Background removed for seamless look */}
        </div>
        
        <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
          <Header 
            apiKey={openAIConfig.apiKey} 
            onChangeApiKey={() => setShowApiKeyInput(true)} 
          />
          
          {showApiKeyInput && (
            <ApiKeyForm
              openAIConfig={openAIConfig}
              setOpenAIConfig={setOpenAIConfig}
              onSubmit={onApiKeySubmit}
              hasGeneratedCampaign={!!generatedCampaign}
              onCancel={generatedCampaign ? () => setShowApiKeyInput(false) : undefined}
            />
          )}
          
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
            chatMemory={chatMemory}
          />
          
          <Footer />
        </div>
      </SidebarInset>
    </>
  );
};

export default Index;
