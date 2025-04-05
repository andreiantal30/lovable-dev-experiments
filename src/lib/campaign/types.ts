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
  braveryScore?: number; // NEW: Added field
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
  keyMetric?: string; // NEW: Added optional keyMetric property
  systemicRoot?: string;
  emotionalParadox?: string;
  culturalTension?: string;
}

export interface MultilayeredInsight extends CreativeInsight {
  systemicRoot: string;
  emotionalParadox: string;
  culturalTension: string;
  systemicHypocrisy: string; // NEW: Explicitly required
  actionParadox: string; // NEW: Explicitly required
  irony?: string; // NEW: Optional field
  brandComplicity?: string; // NEW: Optional field
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
  targetsPower?: number; // NEW: Added field
  avoidsClichés?: number; // NEW: Added field
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
  braveryMatrix: BraveryMatrix; // Now properly required
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
  referenceCampaigns: ReferenceCampaign[];
  evaluation?: CampaignEvaluation;
  storytelling?: string;
  _cdModifications?: string[];
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

// NEW: Explicit type for evaluation with bravery matrix
export interface ExtendedCampaignEvaluation extends CampaignEvaluation {
  braveryMatrix: BraveryMatrix;
}

// NEW: Matching configuration type
export interface MatchingConfig {
  prioritizeBravery?: boolean;
  minBraveryThreshold?: number;
  forceDiverseIndustries?: boolean;
}