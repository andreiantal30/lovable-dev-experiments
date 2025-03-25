
import { v4 as uuidv4 } from 'uuid';
import { Campaign } from '@/lib/campaignData';

/**
 * Campaigns.ts
 * 
 * A static file to store campaign data in a flat format.
 * Edit this file directly to add, modify, or remove campaigns.
 * 
 * Format:
 * - name: Campaign name
 * - brand: Brand name
 * - year: Campaign year (number)
 * - industry: Industry category
 * - targetAudience: Array of target audience segments
 * - objectives: Array of campaign objectives
 * - keyMessage: Primary message of the campaign
 * - strategy: Campaign strategy description
 * - features: Array of campaign features
 * - emotionalAppeal: Array of emotional appeals used
 * - outcomes: Array of campaign outcomes
 * - creativeActivation: Creative activation description (optional)
 * - viralElement: Viral element description (optional)
 */

// Sample campaign data structure - replace with your actual campaigns
export const campaigns: Campaign[] = [
  {
    id: uuidv4(),
    name: "Example Campaign",
    brand: "Example Brand",
    year: 2024,
    industry: "Technology",
    targetAudience: ["Young Adults", "Professionals"],
    objectives: ["Brand Awareness", "Product Launch"],
    keyMessage: "Transforming the way you work",
    strategy: "Showcase product benefits through authentic user stories",
    features: ["Digital Campaign", "Social Media", "Influencer Partnerships"],
    emotionalAppeal: ["Empowerment", "Accomplishment"],
    outcomes: ["Increased Market Share", "Brand Recognition"]
  },
  // Add your campaigns here in the same format
  // {
  //   id: uuidv4(),
  //   name: "Campaign Name",
  //   brand: "Brand Name",
  //   ...
  // }
];

// Maintain backwards compatibility with campaignData export
export const campaignData = campaigns;

/**
 * Helper function to get all campaigns with generated IDs
 * This ensures all campaigns have unique IDs even if added manually
 */
export const getCampaignsWithIds = (): Campaign[] => {
  return campaigns.map(campaign => {
    // If campaign already has an id, use it, otherwise generate a new one
    return campaign.id ? campaign : { ...campaign, id: uuidv4() };
  });
};
