// ✅ Revised types.ts with corrected naming

import { StorytellingOutput } from '../storytellingGenerator';
import { Campaign } from '../campaignData';
import { PersonaType } from '@/types/persona';
import { CreativeLens } from '@/utils/creativeLenses';

export type ReferenceCampaign = {
  id: string;
  name: string;
  brand: string;
  year: number;
  industry: string;
  targetAudience: string[];
  objectives: string[];
  keyMessage: string;
  strategy: string;
  features: string[];
  emotionalAppeal: string[];
  outcomes: string[];
};

export interface CampaignInput {
  brand: string;
  industry: string;
  targetAudience: string[];
  objectives: string[];
  emotionalAppeal: string[];
  additionalConstraints?: string;
  brandPersonality?: string;
  differentiator?: string;
  culturalInsights?: string;
  campaignStyle?: 
    | "digital" 
    | "experiential" 
    | "social" 
    | "influencer" 
    | "guerrilla" 
    | "ugc" 
    | "brand-activism" 
    | "branded-entertainment" 
    | "retail-activation" 
    | "product-placement" 
    | "data-personalization" 
    | "real-time" 
    | "event-based" 
    | "ooh-ambient" 
    | "ai-generated" 
    | "co-creation" 
    | "stunt-marketing" 
    | "ar-vr" 
    | "performance" 
    | "loyalty-community"
    | "stunt"
    | "UGC";
  persona?: PersonaType;
  creativeLens?: CreativeLens;
}

export interface FeedbackCriterion {
  score: number;
  comment: string;
}

export interface CampaignEvaluation {
  insightSharpness: number;
  ideaOriginality: number;
  executionPotential: number;
  awardPotential: number;
  creativeBravery: number;
  finalVerdict: string;
  braveryBreakdown: {
    physicalIntervention: boolean;
    challengesAuthority: boolean;
    culturalTension: boolean;
    personalRisk: boolean;
  };
  braverySuggestions: string[];
}

export interface CampaignVersion {
  id: string;
  versionTag: string;
  timestamp: number;
  campaign: GeneratedCampaign;
}

export interface MultiLayeredInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
}

export interface GeneratedCampaign {
  campaignName: string;
  keyMessage: string;
  insight?: string;
  idea?: string;
  creativeStrategy?: string[];
  executionPlan?: string[];
  expectedOutcomes?: string[];
  viralElement?: string;
  prHeadline?: string;
  emotionalAppeal?: string[];
  callToAction?: string;
  consumerInteraction?: string;
  creativeInsights?: MultiLayeredInsight[];
  referenceCampaigns?: ReferenceCampaign[];
  evaluation?: CampaignEvaluation;
  storytelling?: string;
}