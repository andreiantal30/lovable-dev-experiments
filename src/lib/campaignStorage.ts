
import { Campaign, campaignData } from './campaignData';

// Local storage key for storing campaign data
const CAMPAIGN_STORAGE_KEY = 'campaign-generator-data';

// Get campaigns from local storage or use default data
export const getCampaigns = (): Campaign[] => {
  try {
    const storedCampaigns = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (storedCampaigns) {
      return JSON.parse(storedCampaigns);
    }
    return campaignData;
  } catch (error) {
    console.error('Error retrieving campaigns from storage:', error);
    return campaignData;
  }
};

// Save campaigns to local storage
export const saveCampaigns = (campaigns: Campaign[]): boolean => {
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns));
    return true;
  } catch (error) {
    console.error('Error saving campaigns to storage:', error);
    return false;
  }
};

// Add new campaigns to the database
export const addCampaigns = (newCampaigns: Campaign[]): boolean => {
  try {
    const currentCampaigns = getCampaigns();
    
    // Filter out duplicates based on campaign name and brand
    const uniqueNewCampaigns = newCampaigns.filter(newCampaign => 
      !currentCampaigns.some(existingCampaign => 
        existingCampaign.name === newCampaign.name && 
        existingCampaign.brand === newCampaign.brand
      )
    );
    
    if (uniqueNewCampaigns.length === 0) {
      return false;
    }
    
    // Add unique campaigns to the database
    const updatedCampaigns = [...currentCampaigns, ...uniqueNewCampaigns];
    return saveCampaigns(updatedCampaigns);
  } catch (error) {
    console.error('Error adding campaigns:', error);
    return false;
  }
};

// Delete a campaign from the database
export const deleteCampaign = (campaignId: string): boolean => {
  try {
    const currentCampaigns = getCampaigns();
    const updatedCampaigns = currentCampaigns.filter(campaign => campaign.id !== campaignId);
    
    if (updatedCampaigns.length === currentCampaigns.length) {
      return false; // No campaign was deleted
    }
    
    return saveCampaigns(updatedCampaigns);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
};

// Reset campaign data to default
export const resetCampaignData = (): boolean => {
  try {
    localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting campaign data:', error);
    return false;
  }
};
