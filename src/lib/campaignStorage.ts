import { Campaign } from '@/types/Campaign';
import { campaigns } from '@/data/campaigns';
import { GeneratedCampaign } from './generateCampaign';
import { CampaignEvaluation } from './campaign/types'; // ✅ Add this line
import { v4 as uuidv4 } from 'uuid';

const CAMPAIGN_STORAGE_KEY = 'campaign-generator-data';
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

// 🔁 Notify components
export const emitCampaignUpdate = () => {
  window.dispatchEvent(new Event('campaign-updated'));
};

// 📦 Load static campaigns
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

// 💾 Load saved campaigns (with array patch → object)
export const getSavedCampaigns = (): Record<string, SavedCampaign> => {
  try {
    const raw = localStorage.getItem(SAVED_CAMPAIGNS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    // 🛠 Patch legacy array format
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
    console.error('Error retrieving saved campaigns from storage:', error);
    return {};
  }
}

// 💾 Save to localStorage (object mode)
export function saveCampaignToLibrary(campaign: GeneratedCampaign, brand: string, industry: string): SavedCampaign | null;
export function saveCampaignToLibrary(entry: SavedCampaign): SavedCampaign | null;
export function saveCampaignToLibrary(arg1: any, arg2?: string, arg3?: string): SavedCampaign | null {
  try {
    const savedCampaigns = getSavedCampaigns();
    let newEntry: SavedCampaign;

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

      const existing = Object.values(savedCampaigns).find(
        c => c.campaign.campaignName === campaign.campaignName && c.brand === arg2
      );
      if (existing) {
        console.log('⚠️ Campaign already saved:', campaign.campaignName, arg2);
        return existing;
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

    savedCampaigns[newEntry.id] = newEntry;
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
    return savedCampaigns[id] ?? null;
  } catch (error) {
    console.error('Error retrieving saved campaign:', error);
    return null;
  }
};

// ❌ Delete
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

// ⭐ Toggle favorite
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

// 🧠 Duplicate guard
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