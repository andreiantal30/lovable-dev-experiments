
import { useState, useEffect } from 'react';
import { Message } from '@/components/ChatWindow';
import { Campaign } from '@/lib/campaignData';
import { getCampaigns } from '@/lib/campaignStorage';

interface ChatMemory {
  pastInteractions: Message[];
  userPreferences: {
    preferredTone?: string;
    likedIndustries?: string[];
    preferredCampaignFormats?: string[];
    lastLikedCampaignType?: string;
    dislikedApproaches?: string[];
  };
  referenceCampaigns?: Campaign[];
}

const STORAGE_KEY = 'campaignGenerator_chatMemory';

export function useChatMemory() {
  const [chatMemory, setChatMemory] = useState<ChatMemory>(() => {
    // Initialize from localStorage if available
    const savedMemory = localStorage.getItem(STORAGE_KEY);
    if (savedMemory) {
      try {
        return JSON.parse(savedMemory);
      } catch (e) {
        console.error('Failed to parse saved chat memory:', e);
      }
    }
    
    // Default initial state
    return {
      pastInteractions: [],
      userPreferences: {},
      referenceCampaigns: []
    };
  });

  // Save to localStorage whenever the memory changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatMemory));
  }, [chatMemory]);
  
  // Add a new interaction to the memory
  const addInteraction = (message: Message) => {
    setChatMemory(prev => ({
      ...prev,
      pastInteractions: [...prev.pastInteractions, message].slice(-10) // Keep last 10 messages
    }));
  };
  
  // Update preferences based on user feedback or AI analysis
  const updatePreferences = (preferences: Partial<ChatMemory['userPreferences']>) => {
    setChatMemory(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...preferences
      }
    }));
  };
  
  // Track when a user likes a specific campaign approach
  const trackLikedCampaign = (campaignType: string) => {
    updatePreferences({
      lastLikedCampaignType: campaignType,
      likedIndustries: chatMemory.userPreferences.likedIndustries 
        ? [...chatMemory.userPreferences.likedIndustries, campaignType].filter((v, i, a) => a.indexOf(v) === i)
        : [campaignType]
    });
  };
  
  // Track when a user dislikes a specific approach
  const trackDislikedApproach = (approach: string) => {
    updatePreferences({
      dislikedApproaches: chatMemory.userPreferences.dislikedApproaches 
        ? [...chatMemory.userPreferences.dislikedApproaches, approach].filter((v, i, a) => a.indexOf(v) === i)
        : [approach]
    });
  };
  
  // Update reference campaigns based on user preferences
  const updateReferenceCampaigns = (industry?: string, campaignType?: string) => {
    const allCampaigns = getCampaigns();
    
    // Filter relevant campaigns based on industry and/or campaign type
    let filteredCampaigns = allCampaigns;
    
    if (industry) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.industry.toLowerCase().includes(industry.toLowerCase()) ||
        industry.toLowerCase().includes(campaign.industry.toLowerCase())
      );
    }
    
    if (campaignType) {
      filteredCampaigns = filteredCampaigns.filter(campaign => {
        const campaignText = (campaign.strategy + ' ' + campaign.keyMessage).toLowerCase();
        return campaignText.includes(campaignType.toLowerCase());
      });
    }
    
    // Sort by relevance - this is a simple implementation 
    // You could make this more sophisticated based on user preferences
    const sortedCampaigns = filteredCampaigns.sort(() => 0.5 - Math.random());
    
    // Select up to 3 reference campaigns
    const selectedCampaigns = sortedCampaigns.slice(0, 3);
    
    setChatMemory(prev => ({
      ...prev,
      referenceCampaigns: selectedCampaigns
    }));
    
    return selectedCampaigns;
  };
  
  // Get formatted reference campaigns for prompt injection
  const getFormattedReferenceCampaigns = () => {
    if (!chatMemory.referenceCampaigns || chatMemory.referenceCampaigns.length === 0) {
      return '';
    }
    
    return `
Strategic Reference Campaign Injection

Purpose: Match award-winning examples to your request.

Based on your campaign brief, here are reference campaigns that align closely with your goals, tone, target audience, or strategic approach. Use them as creative inspiration and strategic guidance—not templates—to inform the new campaign idea.

${chatMemory.referenceCampaigns.map((campaign, index) => `
Reference Campaign ${index + 1}:
Campaign Name: ${campaign.name}
Brand: ${campaign.brand}
Industry: ${campaign.industry}
Target Audience: ${campaign.targetAudience.join(', ')}
Key Message: ${campaign.keyMessage}
Strategy: ${campaign.strategy}
Emotional Appeal: ${campaign.emotionalAppeal.join(', ')}
${campaign.viralElement ? `Viral Element: ${campaign.viralElement}` : ''}
`).join('\n')}

Draw strategic parallels, learn from their emotional appeals, and innovate beyond their tactics.
`;
  };
  
  // Clear all stored memory
  const clearMemory = () => {
    setChatMemory({
      pastInteractions: [],
      userPreferences: {},
      referenceCampaigns: []
    });
  };
  
  return {
    chatMemory,
    addInteraction,
    updatePreferences,
    trackLikedCampaign,
    trackDislikedApproach,
    updateReferenceCampaigns,
    getFormattedReferenceCampaigns,
    clearMemory
  };
}
