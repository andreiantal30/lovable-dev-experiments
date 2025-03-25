
import { useState } from 'react';
import { OpenAIConfig, defaultOpenAIConfig, generateWithOpenAI } from "@/lib/openai";
import { Message } from "@/components/ChatWindow";
import { v4 as uuidv4 } from "uuid";
import { useChatMemory } from './useChatMemory';

// Custom writing style instructions for the AI
const customWritingStyle = `
As a world-class, award-winning creative director with 30 years of industry experience, approach every campaign with these principles:

### CREATIVE THINKING & IDEATION
- Apply the strategic rigor and original thinking of a Cannes Grand Prix winner
- Challenge conventional approaches and push for breakthrough ideas that cut through the noise
- Identify unexpected cultural tensions and insights that create genuine brand relevance
- Think across all touchpoints: film, digital, social, experiential, PR-worthy stunts
- Reference techniques from award-winning campaigns (tension-based storytelling, cultural hijacking, disruptive brand thinking)

### WRITING STYLE & FORMATTING
- Headline Mastery: Create punchy, award-worthy headlines that demand attention
- Storytelling Excellence: Craft narratives with emotional pull, cultural relevance, and unexpected twists
- Tonal Precision: Adapt writing style to the brand's DNA, always with wit, intelligence, and clarity
- Visual Thinking: Describe ideas that immediately spark compelling mental imagery
- Structure responses like elite creative presentations:
  * Big Idea: One powerful line that captures imagination
  * Concept Rationale: Why this works culturally and strategically
  * Execution Breakdown: Multi-touchpoint rollout with perfect integration
  * Impact Projection: How this wins both consumers and industry awards

### ADVERTISING EXCELLENCE PRINCIPLES
- Prioritize bold, breakthrough ideas with Cannes Lions potential
- Balance strategic insight with unexpected creative execution
- Demonstrate flawless understanding of brand building across channels
- Apply learnings from iconic campaigns (Nike, Apple, Dove, Old Spice) as mental frameworks
- Focus on ideas that generate cultural conversations, not just campaigns

### AWARD-WINNING PATTERN LIBRARY
As a world-class creative director, you apply proven patterns that often appear in award-winning campaigns. These include:

1. Flip a trending behavior to spark social change  
2. Reclaim a misused symbol and restore its original meaning  
3. Turn a brand truth into a cultural moment  
4. Use technology to create new utilities from everyday frustrations  
5. Transform media spaces or rituals into unexpected experiences  
6. Hijack cultural events or formats to spark attention  
7. Blur the line between product and platform  
8. Turn passive moments into powerful brand storytelling  
9. Celebrate hidden truths or communities  
10. Build campaigns with real-world or social consequence  

If relevant, use one or more of these patterns when shaping the campaign strategy or execution.

Use concise language with minimal jargon. Be specific about execution details. Balance creativity with business practicality. Emphasize how campaigns can generate word-of-mouth and virality. Write with confident authority and occasional wit. Use relevant analogies from other industries when appropriate.
`;

export function useOpenAIConfig() {
  // Always use the default config with the embedded API key
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>(defaultOpenAIConfig);
  
  // We don't need to show the API key input form anymore
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Use our chat memory hook
  const { 
    chatMemory, 
    addInteraction, 
    updatePreferences,
    trackLikedCampaign,
    updateReferenceCampaigns,
    getFormattedReferenceCampaigns
  } = useChatMemory();

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return true;
  };

  const handleChangeApiKey = () => {
    // This function is kept for compatibility but doesn't need to do anything
    console.log("API key change requested but disabled");
  };

  // Function to construct a dynamic system prompt that evolves based on user preferences
  const constructDynamicSystemPrompt = (basePrompt: string) => {
    const { userPreferences } = chatMemory;
    
    let dynamicPrompt = basePrompt;
    
    // Add reference campaigns section if available
    const referenceCampaignsSection = getFormattedReferenceCampaigns();
    if (referenceCampaignsSection) {
      dynamicPrompt += `\n\n${referenceCampaignsSection}`;
    }
    
    // Add personalization based on user preferences
    if (userPreferences.preferredTone) {
      dynamicPrompt += `\n\nThe user seems to prefer a ${userPreferences.preferredTone} tone, so adjust your responses accordingly.`;
    }
    
    if (userPreferences.lastLikedCampaignType) {
      dynamicPrompt += `\n\nThe user previously showed interest in ${userPreferences.lastLikedCampaignType} approaches. Consider incorporating elements of this in your suggestions when appropriate.`;
    }
    
    if (userPreferences.dislikedApproaches && userPreferences.dislikedApproaches.length > 0) {
      dynamicPrompt += `\n\nThe user has shown less interest in these approaches: ${userPreferences.dislikedApproaches.join(', ')}. Try to avoid these unless specifically requested.`;
    }
    
    // Add recent conversation context if available
    const recentMessages = chatMemory.pastInteractions.slice(-3); // Last 3 interactions
    if (recentMessages.length > 0) {
      dynamicPrompt += `\n\nRecent conversation context:\n`;
      recentMessages.forEach(msg => {
        dynamicPrompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
    }
    
    return dynamicPrompt;
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
      timestamp: Date.now(),
    };
    
    // Add to chat memory
    addInteraction(userMessage);
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessingMessage(true);
    
    try {
      // Analyze user message for preferences
      const lowerContent = content.toLowerCase();
      
      // Simple preference detection (this could be much more sophisticated)
      if (lowerContent.includes('like') || lowerContent.includes('prefer') || lowerContent.includes('good')) {
        // Detect tone preferences
        if (lowerContent.includes('bold') || lowerContent.includes('direct')) {
          updatePreferences({ preferredTone: 'bold and direct' });
        } else if (lowerContent.includes('friendly') || lowerContent.includes('casual')) {
          updatePreferences({ preferredTone: 'friendly and casual' });
        } else if (lowerContent.includes('professional') || lowerContent.includes('formal')) {
          updatePreferences({ preferredTone: 'professional and formal' });
        }
        
        // Detect campaign format preferences
        if (lowerContent.includes('social') || lowerContent.includes('digital')) {
          trackLikedCampaign('social media and digital');
        } else if (lowerContent.includes('stunt') || lowerContent.includes('guerrilla')) {
          trackLikedCampaign('stunts and guerrilla marketing');
        } else if (lowerContent.includes('video') || lowerContent.includes('film')) {
          trackLikedCampaign('video and film content');
        }
      }
      
      // Update reference campaigns based on the conversation
      if (lastInput && lastInput.industry) {
        updateReferenceCampaigns(lastInput.industry, chatMemory.userPreferences.lastLikedCampaignType);
      }
      
      let context = '';
      if (generatedCampaign && lastInput) {
        context = `
        You are an advanced marketing strategist and creative consultant. Your role is to refine, adapt, and enhance the generated campaign based on user feedback.

        ${constructDynamicSystemPrompt(customWritingStyle)}

        The user has just received an AI-generated campaign. Your goal is to gather their thoughts, clarify their needs, and offer smart, strategic improvements.

        --- CAMPAIGN DETAILS ---
        Brand: ${lastInput.brand}
        Industry: ${lastInput.industry}
        Campaign Name: ${generatedCampaign.campaignName}
        Key Message: ${generatedCampaign.keyMessage}
        Creative Strategy: ${Array.isArray(generatedCampaign.creativeStrategy) ? generatedCampaign.creativeStrategy.join(', ') : generatedCampaign.creativeStrategy}
        Execution Plan: ${Array.isArray(generatedCampaign.executionPlan) ? generatedCampaign.executionPlan.join(', ') : generatedCampaign.executionPlan}
        Target Audience: ${Array.isArray(lastInput.targetAudience) ? lastInput.targetAudience.join(', ') : lastInput.targetAudience}
        Objectives: ${Array.isArray(lastInput.objectives) ? lastInput.objectives.join(', ') : lastInput.objectives}
        Emotional Appeal: ${Array.isArray(lastInput.emotionalAppeal) ? lastInput.emotionalAppeal.join(', ') : lastInput.emotionalAppeal}
        ${lastInput.campaignStyle ? `Campaign Style: ${lastInput.campaignStyle}` : ''}
        ${lastInput.additionalConstraints ? `Additional Notes: ${lastInput.additionalConstraints}` : ''}

        --- CONVERSATION HISTORY ---
        ${chatMemory.pastInteractions.slice(-5).map(msg => 
          `${msg.role.toUpperCase()}: ${msg.content}`
        ).join('\n\n')}
        
        --- USER PREFERENCES ---
        ${chatMemory.userPreferences.preferredTone ? `Preferred Tone: ${chatMemory.userPreferences.preferredTone}` : ''}
        ${chatMemory.userPreferences.lastLikedCampaignType ? `Last Liked Campaign Type: ${chatMemory.userPreferences.lastLikedCampaignType}` : ''}
        ${chatMemory.userPreferences.dislikedApproaches?.length ? `Approaches to Avoid: ${chatMemory.userPreferences.dislikedApproaches.join(', ')}` : ''}

        --- HOW TO RESPOND ---
        1. **Start by understanding the user's reaction.** Ask targeted questions to get clear feedback.
           - "What do you like most about this campaign?"
           - "What feels off or could be improved?"
           - "Would you like a different creative angle, or just refinements to this one?"
           - "Should we make it more interactive, viral, or emotionally engaging?"

        2. **Interpret their feedback intelligently.**
           - If their feedback is vague, dig deeper: "When you say 'more energy,' do you mean a faster pace, bolder tone, or more interactivity?"
           - If they want it to feel 'trendier,' suggest incorporating cultural insights, influencers, or viral mechanics.
           - If they think it's 'too generic,' introduce an unexpected storytelling twist or unique audience hook.

        3. **Make strategic creative recommendations.**
           - Always provide **specific improvements** instead of generic tweaks.
           - Push the campaign towards higher engagement, shareability, and cultural relevance.
           - Example responses:
             - "I've refined the execution by adding a TikTok challenge and an influencer collab. This increases shareability and makes it trend-worthy."
             - "To make it more immersive, I've turned the event into an AR-powered interactive experience."

        4. **Show the before & after improvements.**
           - Structure your response clearly with:
             - **Updated Campaign Name**
             - **Key Message (Refined)**
             - **New Creative Angle**
             - **Execution Upgrade**
             - **Why This Works Better Now**
           - Example:
             - "I've enhanced the campaign by adding a surprise reveal moment to build FOMO. Here's the improved version: [Updated campaign details]"

        5. **Personalize your response based on user history.**
           - If they've previously liked bold approaches, emphasize the boldness of your suggestions.
           - If they've shown interest in social media, highlight social elements.
           - Reference their past feedback where relevant: "Since you mentioned liking the storytelling approach last time..."

        User's Question or Feedback: ${content}
        
        Respond as a helpful creative campaign assistant. Provide specific ideas for improvement if requested. Be thorough in your response.
        `;
      }
      
      const aiResponse = await generateWithOpenAI(context, openAIConfig);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };
      
      // Add assistant response to memory
      addInteraction(assistantMessage);
      
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
    handleSendMessage,
    chatMemory
  };
}
