import { Campaign } from '@/types/Campaign';
import { campaigns } from '@/data/campaigns';
import { GeneratedCampaign, CampaignEvaluation } from './campaign/types';
import { v4 as uuidv4 } from 'uuid';

const SAVED_CAMPAIGNS_KEY = 'saved-campaigns';

export interface SavedCampaign {
  id: string;
  timestamp: string;
  campaign: GeneratedCampaign;
  brand: string;
  industry: string;
  favorite: boolean;
  prHeadline?: string;
  evaluation?: CampaignEvaluation;
}

export const emitCampaignUpdate = () => {
  window.dispatchEvent(new Event('campaign-updated'));
};

// ✅ Type guard to validate correct shape before saving
const isValidCampaignEntry = (entry: any): entry is SavedCampaign => {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof entry.id === 'string' &&
    typeof entry.timestamp === 'string' &&
    typeof entry.brand === 'string' &&
    typeof entry.industry === 'string' &&
    typeof entry.campaign === 'object' &&
    typeof entry.campaign.campaignName === 'string'
  );
};

export const getCampaigns = (): Campaign[] => {
  try {
    const campaignsWithIds = campaigns.map(campaign => {
      if (!campaign.id) {
        return { ...campaign, id: uuidv4() };
      }
      return campaign;
    });
    console.log("Campaigns loaded from static file:", campaignsWithIds);
    return campaignsWithIds;
  } catch (error) {
    console.error("Error loading campaigns:", error);
    return [];
  }
};

export const getSavedCampaigns = (): Record<string, SavedCampaign> => {
  try {
    const raw = localStorage.getItem(SAVED_CAMPAIGNS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const objectified = parsed.reduce((acc, entry) => {
        if (entry.id) acc[entry.id] = entry;
        return acc;
      }, {} as Record<string, SavedCampaign>);
      localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(objectified));
      console.log("✅ Migrated saved campaigns from array to object format");
      return objectified;
    }

    return parsed;
  } catch (error) {
    console.error('Error retrieving saved campaigns:', error);
    return {};
  }
};

export function saveCampaignToLibrary(entry: any): SavedCampaign | null {
  try {
    console.log("📝 Attempting to save campaign:", entry);

    if (!isValidCampaignEntry(entry)) {
      console.error('❌ Invalid campaign entry — missing required fields or structure:', entry);
      return null;
    }

    const savedCampaigns = getSavedCampaigns();

    if (Object.values(savedCampaigns).some(c => c.campaign.campaignName === entry.campaign.campaignName && c.brand === entry.brand)) {
      console.warn('⚠️ Campaign already saved:', entry.campaign.campaignName);
      return entry;
    }

    savedCampaigns[entry.id] = entry;
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(savedCampaigns));
    emitCampaignUpdate();
    return entry;
  } catch (error) {
    console.error('Error saving campaign:', error);
    return null;
  }
}

export const getSavedCampaignById = (id: string): SavedCampaign | null => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return savedCampaigns[id] ?? null;
  } catch (error) {
    console.error('Error retrieving saved campaign:', error);
    return null;
  }
};

export const removeSavedCampaign = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    if (!savedCampaigns[id]) return false;

    delete savedCampaigns[id];
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(savedCampaigns));
    emitCampaignUpdate();
    return true;
  } catch (error) {
    console.error('Error removing saved campaign:', error);
    return false;
  }
};

export const toggleFavoriteStatus = (id: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    if (!savedCampaigns[id]) return false;

    savedCampaigns[id].favorite = !savedCampaigns[id].favorite;
    localStorage.setItem(SAVED_CAMPAIGNS_KEY, JSON.stringify(savedCampaigns));
    emitCampaignUpdate();
    return true;
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return false;
  }
};

export const isCampaignSaved = (campaignName: string, brand: string): boolean => {
  try {
    const savedCampaigns = getSavedCampaigns();
    return Object.values(savedCampaigns).some(
      c => c.campaign.campaignName === campaignName && c.brand === brand
    );
  } catch (error) {
    console.error('Error checking if campaign is saved:', error);
    return false;
  }
};
