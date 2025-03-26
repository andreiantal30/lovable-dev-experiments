
import { Campaign } from '../campaignData';
import { CampaignInput } from './types';

type SentimentCategory = 'positive' | 'neutral' | 'negative';
type ToneCategory = 'formal' | 'casual' | 'humorous' | 'serious' | 'inspirational';

export interface EnhancedSimilarityScore {
  campaign: Campaign;
  totalScore: number;
  dimensionScores: {
    industry: number;
    audience: number;
    objectives: number;
    emotion: number;
    style: number;
    sentiment: number;
    tone: number;
  };
}

/**
 * Determine the sentiment of a campaign based on its emotional appeal
 */
export function determineSentiment(emotionalAppeal: string[]): SentimentCategory {
  const positiveEmotions = ['joy', 'happiness', 'excitement', 'love', 'pride', 'hope', 'inspiration', 'happiness', 'optimism'];
  const negativeEmotions = ['fear', 'anger', 'sadness', 'guilt', 'shame', 'disgust', 'anxiety', 'frustration', 'disappointment'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  emotionalAppeal.forEach(emotion => {
    const lowerEmotion = emotion.toLowerCase();
    if (positiveEmotions.some(e => lowerEmotion.includes(e))) {
      positiveCount++;
    }
    if (negativeEmotions.some(e => lowerEmotion.includes(e))) {
      negativeCount++;
    }
  });
  
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  }
  return 'neutral';
}

/**
 * Determine the tone of a campaign based on objectives and emotional appeal
 */
export function determineTone(objectives: string[], emotionalAppeal: string[]): ToneCategory {
  const formalKeywords = ['professional', 'authority', 'expertise', 'corporate', 'prestige', 'luxury'];
  const casualKeywords = ['friendly', 'approachable', 'conversational', 'relatable', 'everyday'];
  const humorousKeywords = ['funny', 'humor', 'wit', 'playful', 'quirky', 'entertainment'];
  const seriousKeywords = ['important', 'critical', 'urgent', 'meaningful', 'impactful', 'awareness'];
  const inspirationalKeywords = ['inspire', 'motivation', 'aspiration', 'empowerment', 'dreams', 'future'];
  
  const allText = [...objectives, ...emotionalAppeal].join(' ').toLowerCase();
  
  const counts = {
    formal: formalKeywords.filter(word => allText.includes(word)).length,
    casual: casualKeywords.filter(word => allText.includes(word)).length,
    humorous: humorousKeywords.filter(word => allText.includes(word)).length,
    serious: seriousKeywords.filter(word => allText.includes(word)).length,
    inspirational: inspirationalKeywords.filter(word => allText.includes(word)).length
  };
  
  let maxCount = 0;
  let dominantTone: ToneCategory = 'formal';
  
  for (const [tone, count] of Object.entries(counts) as [ToneCategory, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominantTone = tone;
    }
  }
  
  return dominantTone;
}

/**
 * Score campaign style based on text content
 */
export function scoreCampaignStyle(campaignText: string, campaignStyle: string): number {
  const styleKeywords: Record<string, string[]> = {
    'digital': ['digital', 'online', 'website', 'app', 'mobile'],
    'experiential': ['experience', 'event', 'activation', 'immersive', 'interactive'],
    'social': ['social media', 'social network', 'community', 'user generated'],
    'influencer': ['influencer', 'creator', 'personality', 'ambassador', 'celebrity'],
    'guerrilla': ['guerrilla', 'unconventional', 'unexpected', 'surprise', 'street'],
    'stunt': ['stunt', 'bold', 'attention-grabbing', 'publicity', 'shocking'],
    'UGC': ['user generated', 'ugc', 'community content', 'fan content'],
    'brand-activism': ['activism', 'cause', 'social change', 'environmental', 'purpose'],
    'branded-entertainment': ['entertainment', 'content', 'film', 'series', 'show'],
    'retail-activation': ['retail', 'store', 'shop', 'pop-up', 'in-store'],
    'product-placement': ['placement', 'integration', 'media', 'film', 'show'],
    'data-personalization': ['data', 'personalization', 'personalized', 'tailored', 'custom'],
    'real-time': ['real-time', 'trending', 'reactive', 'newsjacking', 'moment'],
    'event-based': ['event', 'concert', 'sports', 'festival', 'cultural'],
    'ooh-ambient': ['ooh', 'outdoor', 'billboard', 'ambient', 'street'],
    'ai-generated': ['ai', 'artificial intelligence', 'machine learning', 'generated'],
    'co-creation': ['collaboration', 'partnership', 'collab', 'co-create', 'artists'],
    'stunt-marketing': ['stunt', 'bold', 'attention-grabbing', 'publicity', 'shocking'],
    'ar-vr': ['ar', 'vr', 'augmented reality', 'virtual reality', 'mixed reality'],
    'performance': ['performance', 'conversion', 'roi', 'results', 'metrics'],
    'loyalty-community': ['loyalty', 'community', 'membership', 'exclusive', 'belonging']
  };
  
  const relevantKeywords = styleKeywords[campaignStyle] || [];
  const matchCount = relevantKeywords.filter(keyword => campaignText.toLowerCase().includes(keyword)).length;
  
  if (matchCount > 0) {
    return Math.min(matchCount * 2.5, 10);
  }
  
  return 0;
}

/**
 * Get compatibility score between two tones
 */
export function getToneCompatibilityScore(inputTone: ToneCategory, campaignTone: ToneCategory): number {
  const toneCompatibility: Record<ToneCategory, Record<ToneCategory, number>> = {
    'formal': { 'casual': 3, 'humorous': 1, 'serious': 7, 'inspirational': 5, 'formal': 10 },
    'casual': { 'formal': 3, 'humorous': 7, 'serious': 3, 'inspirational': 5, 'casual': 10 },
    'humorous': { 'formal': 1, 'casual': 7, 'serious': 1, 'inspirational': 3, 'humorous': 10 },
    'serious': { 'formal': 7, 'casual': 3, 'humorous': 1, 'inspirational': 5, 'serious': 10 },
    'inspirational': { 'formal': 5, 'casual': 5, 'humorous': 3, 'serious': 5, 'inspirational': 10 }
  };
  
  return toneCompatibility[inputTone][campaignTone];
}
