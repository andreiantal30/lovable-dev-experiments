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
  const positiveEmotions = ['joy', 'happiness', 'excitement', 'love', 'pride', 'hope', 'inspiration', 'optimism'];
  const negativeEmotions = ['fear', 'anger', 'sadness', 'guilt', 'shame', 'disgust', 'anxiety', 'frustration', 'disappointment'];

  let score = 0;
  for (const emotion of emotionalAppeal.map(e => e.toLowerCase())) {
    if (positiveEmotions.some(pe => emotion.includes(pe))) score++;
    if (negativeEmotions.some(ne => emotion.includes(ne))) score--;
  }

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

/**
 * Determine the tone of a campaign based on objectives and emotional appeal
 */
export function determineTone(objectives: string[], emotionalAppeal: string[]): ToneCategory {
  const text = [...objectives, ...emotionalAppeal].join(" ").toLowerCase();

  const tones: Record<ToneCategory, string[]> = {
    formal: ['professional', 'authority', 'corporate', 'executive', 'reputation', 'luxury'],
    casual: ['friendly', 'everyday', 'conversational', 'relatable', 'chill'],
    humorous: ['funny', 'humor', 'quirky', 'playful', 'meme', 'lol', 'banter'],
    serious: ['important', 'urgent', 'serious', 'awareness', 'educate', 'highlight'],
    inspirational: ['inspire', 'dream', 'empower', 'motivate', 'aspiration', 'change']
  };

  const scores: Record<ToneCategory, number> = {
    formal: 0,
    casual: 0,
    humorous: 0,
    serious: 0,
    inspirational: 0
  };

  for (const [tone, keywords] of Object.entries(tones)) {
    keywords.forEach(word => {
      if (text.includes(word)) scores[tone as ToneCategory]++;
    });
  }

  const topTone = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return topTone && topTone[1] > 0 ? (topTone[0] as ToneCategory) : 'casual';
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

  return Math.min(matchCount * 2.5, 10);
}

/**
 * Get compatibility score between two tones
 */
export function getToneCompatibilityScore(inputTone: ToneCategory, campaignTone: ToneCategory): number {
  const toneCompatibility: Record<ToneCategory, Record<ToneCategory, number>> = {
    formal: { formal: 10, casual: 3, humorous: 1, serious: 7, inspirational: 5 },
    casual: { formal: 3, casual: 10, humorous: 7, serious: 3, inspirational: 5 },
    humorous: { formal: 1, casual: 7, humorous: 10, serious: 1, inspirational: 3 },
    serious: { formal: 7, casual: 3, humorous: 1, serious: 10, inspirational: 5 },
    inspirational: { formal: 5, casual: 5, humorous: 3, serious: 5, inspirational: 10 }
  };

  return toneCompatibility[inputTone][campaignTone];
}