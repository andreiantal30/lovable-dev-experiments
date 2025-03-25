
import { CampaignInput } from "./generateCampaign";
import { CampaignFeedbackData } from "@/components/FeedbackSystem";

// Storage key
const FEEDBACK_STORAGE_KEY = 'campaign-feedback-data';

// Structure for storing feedback data
export interface StoredFeedback {
  id: string;
  campaignId: string;
  feedback: CampaignFeedbackData;
  input: CampaignInput;
  timestamp: string;
}

// Retrieve all feedback data
export const getFeedbackData = (): StoredFeedback[] => {
  try {
    const storedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (storedFeedback) {
      return JSON.parse(storedFeedback);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving feedback data:', error);
    return [];
  }
};

// Save new feedback
export const saveFeedbackData = async ({
  campaignId,
  feedback,
  input
}: {
  campaignId: string;
  feedback: CampaignFeedbackData;
  input: CampaignInput;
}): Promise<StoredFeedback | null> => {
  try {
    const storedFeedback = getFeedbackData();
    
    const newFeedback: StoredFeedback = {
      id: `feedback_${Date.now()}`,
      campaignId,
      feedback,
      input,
      timestamp: new Date().toISOString()
    };
    
    const updatedFeedback = [...storedFeedback, newFeedback];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback));
    
    console.log('Saved feedback data for future fine-tuning:', newFeedback);
    
    return newFeedback;
  } catch (error) {
    console.error('Error saving feedback data:', error);
    return null;
  }
};

// Get feedback related to specific industry or elements
export const getFeedbackByIndustry = (industry: string): StoredFeedback[] => {
  const allFeedback = getFeedbackData();
  return allFeedback.filter(item => 
    item.input.industry.toLowerCase() === industry.toLowerCase()
  );
};

// Get feedback with high ratings for specific element
export const getPositiveFeedbackForElement = (
  elementName: keyof CampaignFeedbackData['elementRatings']
): StoredFeedback[] => {
  const allFeedback = getFeedbackData();
  return allFeedback.filter(item => 
    item.feedback.elementRatings[elementName] === 1
  );
};

// Get aggregate stats on feedback
export const getFeedbackStats = () => {
  const allFeedback = getFeedbackData();
  
  if (allFeedback.length === 0) {
    return {
      averageRating: 0,
      totalFeedbackCount: 0,
      elementStats: {
        campaignName: { positive: 0, negative: 0, neutral: 0 },
        keyMessage: { positive: 0, negative: 0, neutral: 0 },
        creativeStrategy: { positive: 0, negative: 0, neutral: 0 },
        executionPlan: { positive: 0, negative: 0, neutral: 0 }
      }
    };
  }
  
  // Calculate average overall rating
  const averageRating = allFeedback.reduce((sum, item) => 
    sum + item.feedback.overallRating, 0
  ) / allFeedback.length;
  
  // Calculate stats for each element
  const elementStats = {
    campaignName: { positive: 0, negative: 0, neutral: 0 },
    keyMessage: { positive: 0, negative: 0, neutral: 0 },
    creativeStrategy: { positive: 0, negative: 0, neutral: 0 },
    executionPlan: { positive: 0, negative: 0, neutral: 0 }
  };
  
  // Count positive/negative/neutral ratings for each element
  allFeedback.forEach(item => {
    Object.entries(item.feedback.elementRatings).forEach(([key, value]) => {
      const typedKey = key as keyof typeof elementStats;
      if (value === 1) {
        elementStats[typedKey].positive++;
      } else if (value === -1) {
        elementStats[typedKey].negative++;
      } else {
        elementStats[typedKey].neutral++;
      }
    });
  });
  
  return {
    averageRating,
    totalFeedbackCount: allFeedback.length,
    elementStats
  };
};
