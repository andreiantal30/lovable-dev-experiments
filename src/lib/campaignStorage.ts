import { Campaign } from '@/types/Campaign';
import { campaigns } from '@/data/campaigns';
import { GeneratedCampaign } from './generateCampaign';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const CAMPAIGN_STORAGE_KEY = 'campaign-generator-data';
const SAVED_CAMPAIGNS_KEY = 'saved-campaigns';

export interface SavedCampaign {
  id: string;
  timestamp: string;
  campaign: GeneratedCampaign;
  brand: string;
  industry: string;
  favorite: boolean;
}

// 🔁 Notify components
export const emitCampaignUpdate = () => {
  window.dispatchEvent(new Event('campaign-updated'));
};

// 📦 Load static campaigns
export const getCampaigns = (): Campaign[] => {
  try {
    const campaignsWithIds = campaigns.map(campaign => {
      if (!campaign.id) {
        return {
          ...campaign,
          id: uuidv4()
        };
      }
      return campaign;
    });
    console.log("Campaigns loaded from static file:", campaignsWithIds);
    return campaignsWithIds as Campaign[];
  } catch (error) {
    console.error("Error loading campaigns:", error);
    return [];
  }
};

// 🧹 Legacy (deprecated)
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

// 💾 Load from localStorage
export const getSavedCampaigns = (): SavedCampaign[] => {
  try {
    const storedCampaigns = localStorage.getItem(SAVED_CAMPAIGNS_KEY);
    return storedCampaigns ? JSON.parse(storedCampaigns) : [];
  } catch (error) {
    console.error('Error retrieving saved campaigns from storage:', error);
    return [];
  }
};

// 💾 Save to localStorage (overload-safe)
export function saveCampaignToLibrary(campaign: GeneratedCampaign, brand: string, industry: string): SavedCampaign | null;
export function saveCampaignToLibrary(entry: SavedCampaign): SavedCampaign | null;
export function saveCampaignToLibrary(arg1: any, arg2?: string, arg3?: string): SavedCampaign | null {
  try {
    const savedCampaigns = getSavedCampaigns();

    let newEntry: SavedCampaign;

    // Full object variant
    if (typeof arg1 === 'object' && 'id' in arg1 && 'campaign' in arg1) {
      newEntry = arg1 as SavedCampaign;
    } else {
      const campaign: GeneratedCampaign = {
        ...arg1,
        prHeadline: arg1.prHeadline ?? "",
        storytelling: arg1.storytelling ?? "",
        evaluation: arg1.evaluation ?? {
          insightSharpness: 0,
          ideaOriginality: 0,
          executionPotential: 0,
          awardPotential: 0,
          finalVerdict: ""
        }
      };

      if (isCampaignSaved(campaign.campaignName, arg2!)) {
        console.log('Campaign already saved', campaign.campaignName, arg2);
        const existing = savedCampaigns.find(c => c.campaign.campaignName === campaign.campaignName && c.brand === arg2);
        return existing || null;
      }

      newEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        campaign,
        brand: arg2!,
        industry: arg3!,
        favorite: false
      };
    }

    savedCampaigns.push(newEntry);
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(savedCampaigns));
    emitCampaignUpdate();
    return newEntry;
  } catch (error) {
    console.error('Error saving campaign to library:', error);
    return null;
  }
}

// 🔍 Get by ID
export const getSavedCampaignById = (id: string): SavedCampaign | null => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return savedCampaigns.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error retrieving saved campaign:', error);
    return null;
  }
};

// ❌ Delete
export const removeSavedCampaign = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    const updatedSavedCampaigns = savedCampaigns.filter(c => c.id !== id);
    if (updatedSavedCampaigns.length === savedCampaigns.length) return false;

    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(updatedSavedCampaigns));
    emitCampaignUpdate();
    return true;
  } catch (error) {
    console.error('Error removing saved campaign:', error);
    return false;
  }
};

// ⭐ Toggle favorite
export const toggleFavoriteStatus = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    const updatedSavedCampaigns = savedCampaigns.map(c => ({
      ...c,
      favorite: c.id === id ? !c.favorite : c.favorite
    }));

    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(updatedSavedCampaigns));
    emitCampaignUpdate();
    return true;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return false;
  }
};

// 🧠 Duplicate guard
export const isCampaignSaved = (campaignName: string, brand: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return savedCampaigns.some(
      c => c.campaign.campaignName === campaignName && c.brand === brand
    );
  } catch (error) {
    console.error('Error checking if campaign is saved:', error);
    return false;
  }
};