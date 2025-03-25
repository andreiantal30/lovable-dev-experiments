
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
    name: "The Migraine Pose",
    brand: "Excedrin",
    year: 2024,
    industry: "Pharmaceutical",
    targetAudience: ["Migraine sufferers", "Social media users", "Healthcare advocates"],
    objectives: ["Raise awareness about migraines", "Correct misconceptions from viral trends"],
    keyMessage: "What’s a cute pose for one person could be a cry for help for another.",
    strategy: "Reclaim a misused pose to raise awareness about real pain.",
    features: [
      "Partnered with influencers to tell real migraine stories",
      "Launched filters that faded visuals like migraine aura",
      "Created contrast videos showing fake vs. real pain"
    ],
    emotionalAppeal: ["Empathy", "Awareness", "Advocacy"],
    outcomes: ["490M+ impressions", "Sharp rise in awareness and shares", "$11M+ in earned media", "Increased trust in Excedrin"],
    creativeActivation: "The Migraine Pose flipped a viral trend to spark empathy and discussion.",
    viralElement: "Meme trend → Awareness sparked → Real stories shared → Respect and empathy grow"
  }
  {
    id: uuidv4(),
    name: "DoorDash - All The Ads",
    brand: "DoorDash",
    year: 2024,
    industry: "Food Delivery",
    targetAudience: ["Super Bowl viewers", "Online shoppers"],
    objectives: ["Showcase delivery capabilities", "Tie into Super Bowl culture", "Drive mass participation"],
    keyMessage: "You can get anything you see in a Super Bowl ad—delivered by DoorDash.",
    strategy: "Hijack every Super Bowl ad by offering to deliver *anything* advertised during the big game.",
    features: [
      "Real-time product recognition system",
      "Live Super Bowl ad database",
      "Prize draw for everyone who entered a product"
    ],
    emotionalAppeal: ["Excitement", "Convenience", "FOMO"],
    outcomes: ["11.9B impressions", "8M+ product entries", "Massive brand engagement"],
    creativeActivation: "Live activation during the Super Bowl where DoorDash promised to deliver anything viewers saw advertised",
    viralElement: "Gamified ad hijack during the most-watched TV event in the world"
  }
  
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
