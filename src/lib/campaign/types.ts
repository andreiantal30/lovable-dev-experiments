
import { StorytellingOutput } from '../storytellingGenerator';
import { Campaign } from '../campaignData';
import { PersonaType } from '@/types/persona';
import { CreativeLens } from '@/utils/creativeLenses';

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
  insightSharpness: FeedbackCriterion;
  ideaOriginality: FeedbackCriterion;
  executionPotential: FeedbackCriterion;
  awardPotential: FeedbackCriterion;
  finalVerdict: string;
}

export interface GeneratedCampaign {
  campaignName: string;
  keyMessage: string;
  creativeStrategy: string[];
  executionPlan: string[];
  expectedOutcomes: string[];
  viralHook?: string;
  consumerInteraction?: string;
  referenceCampaigns: Campaign[];
  storytelling?: StorytellingOutput;
  viralElement?: string;
  callToAction?: string;
  emotionalAppeal?: string[];
  evaluation?: CampaignEvaluation;
  creativeInsights?: string[];
}
