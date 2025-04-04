import { StorytellingOutput } from '../storytellingGenerator';
import { PersonaType } from '@/types/persona';
import { CreativeLens } from '@/utils/creativeLenses';

// ================== CORE CAMPAIGN TYPES ================== //
export type ReferenceCampaign = {
  id: string;
  name: string;
  brand: string;
  year: number; // Required field
  industry: string;
  targetAudience: string[];
  objectives: string[];
  keyMessage: string;
  strategy: string;
  features: string[];
  emotionalAppeal: string[];
  outcomes: string[];
};

export interface Campaign extends ReferenceCampaign {
  // Additional fields for full campaign documents
  isTemplate?: boolean;
  versions?: CampaignVersion[];
  archived?: boolean;
  createdAt?: Date;
}

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
    | "digital" | "experiential" | "social" | "influencer" 
    | "guerrilla" | "ugc" | "brand-activism" | "branded-entertainment"
    | "retail-activation" | "product-placement" | "data-personalization"
    | "real-time" | "event-based" | "ooh-ambient" | "ai-generated"
    | "co-creation" | "stunt-marketing" | "ar-vr" | "performance"
    | "loyalty-community" | "stunt" | "UGC";
  persona?: PersonaType;
  creativeLens?: CreativeLens;
}

// ================== INSIGHT TYPES ================== //
export interface CreativeInsight {
  surfaceInsight: string;
  emotionalUndercurrent: string;
  creativeUnlock: string;
  systemicRoot?: string;
  emotionalParadox?: string;
  culturalTension?: string;
}

export interface MultilayeredInsight extends CreativeInsight {
  systemicRoot: string;
  emotionalParadox: string;
  culturalTension: string;
}

// Type guard for deepened insights
export function isMultilayered(insight: CreativeInsight): insight is MultilayeredInsight {
  return !!insight.systemicRoot && !!insight.emotionalParadox && !!insight.culturalTension;
}

// ================== EVALUATION TYPES ================== //
export interface BraveryMatrix {
  physicalIntervention: number;
  institutionalChallenge: number;
  personalRisk: number;
  culturalTension: number;
  novelty: number;
  braveryMatrix?: BraveryMatrix;
}

export interface CampaignEvaluation {
  insightSharpness: number;
  ideaOriginality: number;
  executionPotential: number;
  awardPotential: number;
  creativeBravery: number;
  finalVerdict: string;
  braveryBreakdown: BraveryMatrix;
  braverySuggestions: string[];

  braveryMatrix?: BraveryMatrix; // ✅ Add this
}

// ================== GENERATED CAMPAIGN ================== //
export interface GeneratedCampaign {
  campaignName: string;
  keyMessage: string;
  insight?: string;
  idea?: string;
  creativeStrategy: string[];
  executionPlan: string[];
  expectedOutcomes: string[];
  viralElement?: string;
  prHeadline?: string;
  emotionalAppeal: string[];
  callToAction: string;
  consumerInteraction?: string;
  creativeInsights: MultilayeredInsight[];
  referenceCampaigns: ReferenceCampaign[]; // Now properly required
  evaluation?: CampaignEvaluation;
  storytelling?: string;
  _cdModifications?: string[]; // Track Creative Director changes
}

// ================== VERSION CONTROL ================== //
export interface CampaignVersion {
  id: string;
  versionTag: string;
  timestamp: number;
  campaign: GeneratedCampaign;
  parentVersionId?: string;
  changeLog?: string[];
}

// ================== FEEDBACK SYSTEM ================== //
export interface FeedbackCriterion {
  score: number;
  comment: string;
  dimension: 
    | 'creativity' 
    | 'effectiveness' 
    | 'feasibility' 
    | 'innovation' 
    | 'emotional-impact';
}

export interface ExtendedCampaignEvaluation extends CampaignEvaluation {
  braveryMatrix: BraveryMatrix;
}