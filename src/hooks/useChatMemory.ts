
import { useState, useEffect } from 'react';
import { Message } from '@/components/ChatWindow';

interface ChatMemory {
  pastInteractions: Message[];
  userPreferences: {
    preferredTone?: string;
    likedIndustries?: string[];
    preferredCampaignFormats?: string[];
    lastLikedCampaignType?: string;
    dislikedApproaches?: string[];
  };
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
      userPreferences: {}
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
  
  // Clear all stored memory
  const clearMemory = () => {
    setChatMemory({
      pastInteractions: [],
      userPreferences: {}
    });
  };
  
  return {
    chatMemory,
    addInteraction,
    updatePreferences,
    trackLikedCampaign,
    trackDislikedApproach,
    clearMemory
  };
}
