
import { Campaign } from '@/types/Campaign';
import { campaigns } from '@/data/campaigns';
import { GeneratedCampaign } from './generateCampaign';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const CAMPAIGN_STORAGE_KEY = 'campaign-generator-data';
const SAVED_CAMPAIGNS_KEY = 'saved-campaigns';

// Sample campaign interface
export interface SavedCampaign {
  id: string;
  timestamp: string;
  campaign: GeneratedCampaign;
  brand: string;
  industry: string;
  favorite: boolean;
}

// Event for notifying components about campaign updates
export const emitCampaignUpdate = () => {
  window.dispatchEvent(new Event('campaign-updated'));
};

// Get campaigns - always use the static file data
export const getCampaigns = (): Campaign[] => {
  // Return the campaigns from the static file with IDs
  return campaigns as Campaign[];
};

// Legacy functions maintained for compatibility
export const saveCampaigns = (campaigns: Campaign[]): boolean => {
  console.warn('saveCampaigns is deprecated. Edit the static file directly.');
  return false;
};

export const addCampaigns = (newCampaigns: Campaign[]): boolean => {
  console.warn('addCampaigns is deprecated. Edit the static file directly.');
  return false;
};

export const deleteCampaign = (campaignId: string): boolean => {
  console.warn('deleteCampaign is deprecated. Edit the static file directly.');
  return false;
};

export const resetCampaignData = (): boolean => {
  console.warn('resetCampaignData is deprecated. Edit the static file directly.');
  return false;
};

// SAVED CAMPAIGNS FUNCTIONS - These still use localStorage for user-saved generated campaigns

// Get all saved campaigns
export const getSavedCampaigns = (): SavedCampaign[] => {
  try {
    const storedCampaigns = localStorage.getItem(SAVED_CAMPAIGNS_KEY);
    if (storedCampaigns) {
      return JSON.parse(storedCampaigns);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving saved campaigns from storage:', error);
    return [];
  }
};

// Save a campaign to the library
export const saveCampaignToLibrary = (
  campaign: GeneratedCampaign,
  brand: string,
  industry: string
): SavedCampaign | null => {
  try {
    // Check if campaign already exists
    if (isCampaignSaved(campaign.campaignName, brand)) {
      console.log('Campaign already saved', campaign.campaignName, brand);
      // Find and return the existing campaign
      const savedCampaigns = getSavedCampaigns();
      const existingCampaign = savedCampaigns.find(
        c => c.campaign.campaignName === campaign.campaignName && c.brand === brand
      );
      return existingCampaign || null;
    }
    
    const savedCampaigns = getSavedCampaigns();
    
    const newSavedCampaign: SavedCampaign = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      campaign,
      brand,
      industry,
      favorite: false
    };
    
    const updatedSavedCampaigns = [...savedCampaigns, newSavedCampaign];
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(updatedSavedCampaigns));
    
    // Emit event to notify components about the update
    emitCampaignUpdate();
    
    return newSavedCampaign;
  } catch (error) {
    console.error('Error saving campaign to library:', error);
    return null;
  }
};

// Get a saved campaign by ID
export const getSavedCampaignById = (id: string): SavedCampaign | null => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return savedCampaigns.find(campaign => campaign.id === id) || null;
  } catch (error) {
    console.error('Error retrieving saved campaign:', error);
    return null;
  }
};

// Remove a saved campaign
export const removeSavedCampaign = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    const updatedSavedCampaigns = savedCampaigns.filter(campaign => campaign.id !== id);
    
    if (updatedSavedCampaigns.length === savedCampaigns.length) {
      return false; // No campaign was deleted
    }
    
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(updatedSavedCampaigns));
    
    // Emit event to notify components about the update
    emitCampaignUpdate();
    
    return true;
  } catch (error) {
    console.error('Error removing saved campaign:', error);
    return false;
  }
};

// Toggle favorite status of a campaign
export const toggleFavoriteStatus = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    const updatedSavedCampaigns = savedCampaigns.map(campaign => {
      if (campaign.id === id) {
        return {
          ...campaign,
          favorite: !campaign.favorite
        };
      }
      return campaign;
    });
    
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(updatedSavedCampaigns));
    
    // Emit event to notify components about the update
    emitCampaignUpdate();
    
    return true;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return false;
  }
};

// Check if a campaign is already saved (by campaignName and brand)
export const isCampaignSaved = (campaignName: string, brand: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return savedCampaigns.some(
      campaign => 
        campaign.campaign.campaignName === campaignName && 
        campaign.brand === brand
    );
  } catch (error) {
    console.error('Error checking if campaign is saved:', error);
    return false;
  }
};
