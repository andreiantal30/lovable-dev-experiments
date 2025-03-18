
import { useState } from 'react';
import { OpenAIConfig, defaultOpenAIConfig, generateWithOpenAI } from "@/lib/openai";
import { Message } from "@/components/ChatWindow";
import { v4 as uuidv4 } from "uuid";

export function useOpenAIConfig() {
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>(() => {
    const savedConfig = localStorage.getItem('openai-config');
    return savedConfig ? JSON.parse(savedConfig) : defaultOpenAIConfig;
  });
  
  const [showApiKeyInput, setShowApiKeyInput] = useState(!openAIConfig.apiKey);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('openai-config', JSON.stringify(openAIConfig));
    setShowApiKeyInput(false);
    return true;
  };

  const handleChangeApiKey = () => {
    setShowApiKeyInput(true);
  };

  const handleSendMessage = async (
    content: string, 
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setIsProcessingMessage: React.Dispatch<React.SetStateAction<boolean>>,
    isProcessingMessage: boolean,
    generatedCampaign: any,
    lastInput: any
  ) => {
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
    } finally {
      setIsProcessingMessage(false);
    }
  };

  return {
    openAIConfig,
    setOpenAIConfig,
    showApiKeyInput,
    setShowApiKeyInput,
    handleApiKeySubmit,
    handleChangeApiKey,
    handleSendMessage
  };
}
