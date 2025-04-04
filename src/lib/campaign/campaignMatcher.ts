import { Campaign } from '../campaignData';
import { CampaignInput } from './types';
import {
  determineSentiment,
  determineTone,
  scoreCampaignStyle,
  getToneCompatibilityScore,
  EnhancedSimilarityScore
} from './creativeSimilarity';
import { matchReferenceCampaigns } from '@/utils/matchReferenceCampaigns';
import { findSimilarCampaignsWithEmbeddings } from '@/lib/embeddingsUtil';
import { campaigns } from '@/data/campaigns';
import { OpenAIConfig } from '../openai';

interface ReferenceCampaign {
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
}

export const findSimilarCampaigns = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<ReferenceCampaign[]> => {
  try {
    console.log('Using new reference campaign matcher');
    const matchedCampaigns = matchReferenceCampaigns(input);

    if (matchedCampaigns && matchedCampaigns.length > 0) {
      console.log('Found matches using new reference campaign matcher:', matchedCampaigns.map(c => c.name));
      return convertToReferenceCampaigns(diversifyCampaignSelection(matchedCampaigns));
    }
  } catch (error) {
    console.error('Error with new reference campaign matcher:', error);
  }

  if (openAIConfig.apiKey) {
    try {
      const embeddingResults = await findSimilarCampaignsWithEmbeddings(
        input,
        campaigns as Campaign[],
        openAIConfig
      );

      if (embeddingResults && embeddingResults.length > 0) {
        console.log('Using embedding-based campaign matches');
        return convertToReferenceCampaigns(diversifyCampaignSelection(embeddingResults));
      }
    } catch (error) {
      console.error('Error with embedding-based matching:', error);
    }
  }

  console.log('Using traditional campaign matching');
  return convertToReferenceCampaigns(diversifyCampaignSelection(findSimilarCampaignsTraditional(input)));
};

function convertToReferenceCampaigns(campaigns: Campaign[]): ReferenceCampaign[] {
  return campaigns.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    brand: campaign.brand,
    year: campaign.year || new Date().getFullYear(),
    industry: campaign.industry,
    targetAudience: campaign.targetAudience || [],
    objectives: campaign.objectives || [],
    keyMessage: campaign.keyMessage || '',
    strategy: campaign.strategy || '',
    features: campaign.features || [],
    emotionalAppeal: campaign.emotionalAppeal || [],
    outcomes: campaign.outcomes || []
  }));
}

export const findThematicMatches = async (input: CampaignInput): Promise<Campaign[]> => {
  const similar = await findSimilarCampaigns(input);
  const thematicGroups = groupByThemes(similar);
  const oppositeIndustry = selectRandomWildcardCampaigns(similar, 2);
  return [...thematicGroups["institutional rebellion"], ...oppositeIndustry];
};

const groupByThemes = (campaigns: Campaign[]) => {
  const themes: Record<string, Campaign[]> = {
    "institutional rebellion": [],
    "personal vulnerability": [],
    "cultural tension": [],
    "system hacking": []
  };

  campaigns.forEach(c => {
    if (/protest|activism|petition/i.test(c.keyMessage)) {
      themes["institutional rebellion"].push(c);
    } else if (/confess|vulnerable|truth/i.test(c.strategy)) {
      themes["personal vulnerability"].push(c);
    } else if (/culture|society|inequality|privilege/i.test(c.strategy)) {
      themes["cultural tension"].push(c);
    } else if (/subvert|glitch|hack/i.test(c.strategy)) {
      themes["system hacking"].push(c);
    }
  });

  return themes;
};

export function findSimilarCampaignsTraditional(input: CampaignInput): Campaign[] {
  const inputSentiment = determineSentiment(input.emotionalAppeal);
  const inputTone = determineTone(input.objectives, input.emotionalAppeal);

  const scoredCampaigns: EnhancedSimilarityScore[] = (campaigns as Campaign[]).map(campaign => {
    const dimensionScores = {
      industry: 0,
      audience: 0,
      objectives: 0,
      emotion: 0,
      style: 0,
      sentiment: 0,
      tone: 0
    };

    if (campaign.industry.toLowerCase() === input.industry.toLowerCase()) {
      dimensionScores.industry = 5;
    } else if (
      campaign.industry.toLowerCase().includes(input.industry.toLowerCase()) ||
      input.industry.toLowerCase().includes(campaign.industry.toLowerCase())
    ) {
      dimensionScores.industry = 3;
    }

    let audienceMatchCount = 0;
    input.targetAudience.forEach(audience => {
      if (campaign.targetAudience.some(a => a.toLowerCase().includes(audience.toLowerCase()) || audience.toLowerCase().includes(a.toLowerCase()))) {
        audienceMatchCount++;
      }
    });
    dimensionScores.audience = Math.min(audienceMatchCount * 5, 15);

    let objectivesMatchCount = 0;
    input.objectives.forEach(objective => {
      if (campaign.objectives.some(o => o.toLowerCase().includes(objective.toLowerCase()) || objective.toLowerCase().includes(o.toLowerCase()))) {
        objectivesMatchCount++;
      }
    });
    dimensionScores.objectives = Math.min(objectivesMatchCount * 5, 15);

    let emotionMatchCount = 0;
    input.emotionalAppeal.forEach(emotion => {
      if (campaign.emotionalAppeal.some(e => e.toLowerCase().includes(emotion.toLowerCase()) || emotion.toLowerCase().includes(e.toLowerCase()))) {
        emotionMatchCount++;
      }
    });
    dimensionScores.emotion = Math.min(emotionMatchCount * 5, 15);

    if (input.campaignStyle) {
      const campaignText = (campaign.strategy + ' ' + campaign.keyMessage).toLowerCase();
      dimensionScores.style = scoreCampaignStyle(campaignText, input.campaignStyle);
    }

    const campaignSentiment = determineSentiment(campaign.emotionalAppeal);
    if (inputSentiment === campaignSentiment) {
      dimensionScores.sentiment = 10;
    } else if (
      (inputSentiment === 'neutral' && campaignSentiment !== 'neutral') ||
      (campaignSentiment === 'neutral' && inputSentiment !== 'neutral')
    ) {
      dimensionScores.sentiment = 5;
    }

    const campaignTone = determineTone(campaign.objectives, campaign.emotionalAppeal);
    dimensionScores.tone = getToneCompatibilityScore(inputTone, campaignTone);

    const totalScore = Object.values(dimensionScores).reduce((sum, score) => sum + score, 0);

    return {
      campaign,
      totalScore,
      dimensionScores
    };
  });

  const topScoring = scoredCampaigns.sort((a, b) => b.totalScore - a.totalScore).slice(0, 20);

  return selectDiverseCampaigns(topScoring, 5).map(s => s.campaign);
}

function selectDiverseCampaigns(scoredCampaigns: EnhancedSimilarityScore[], count: number): EnhancedSimilarityScore[] {
  const selected: EnhancedSimilarityScore[] = [];

  if (scoredCampaigns.length > 0) {
    selected.push(scoredCampaigns[0]);
  }

  while (selected.length < count && selected.length < scoredCampaigns.length) {
    const avgDimensionScores: Record<string, number> = {};
    Object.keys(scoredCampaigns[0].dimensionScores).forEach(dimension => {
      avgDimensionScores[dimension] = selected.reduce(
        (sum, item) => sum + item.dimensionScores[dimension as keyof typeof item.dimensionScores],
        0
      ) / selected.length;
    });

    let bestComplement: EnhancedSimilarityScore | null = null;
    let bestComplementScore = -1;

    for (const candidate of scoredCampaigns) {
      if (selected.some(s => s.campaign.id === candidate.campaign.id)) continue;

      let complementScore = 0;
      let diversityScore = 0;

      Object.entries(avgDimensionScores).forEach(([dimension, avgScore]) => {
        const dimensionKey = dimension as keyof typeof candidate.dimensionScores;
        if (avgScore < 7 && candidate.dimensionScores[dimensionKey] > avgScore) {
          complementScore += candidate.dimensionScores[dimensionKey] - avgScore;
        }
      });

      const uniqueIndustry = !selected.some(s => s.campaign.industry === candidate.campaign.industry);
      const uniqueEmotion = !selected.some(s => 
        s.campaign.emotionalAppeal.some(e => 
          candidate.campaign.emotionalAppeal.includes(e)
        )
      );

      if (uniqueIndustry) diversityScore += 5;
      if (uniqueEmotion) diversityScore += 5;

      const totalComplementScore = complementScore + diversityScore;

      if (totalComplementScore > bestComplementScore) {
        bestComplementScore = totalComplementScore;
        bestComplement = candidate;
      }
    }

    if (bestComplement) {
      selected.push(bestComplement);
    } else {
      const nextBest = scoredCampaigns.find(
        candidate => !selected.some(s => s.campaign.id === candidate.campaign.id)
      );
      if (nextBest) selected.push(nextBest);
      else break;
    }
  }

  return selected.slice(0, count);
}

function diversifyCampaignSelection(campaignsToInclude: Campaign[]): Campaign[] {
  const MAX_RESULTS = 5;
  const finalSelection: Campaign[] = [];
  const industries = new Set<string>();
  const emotionalAppeals = new Set<string>();

  for (const campaign of campaignsToInclude) {
    const newIndustry = !industries.has(campaign.industry);
    const newEmotion = campaign.emotionalAppeal.some(emotion => 
      !Array.from(emotionalAppeals).some(e => e.toLowerCase() === emotion.toLowerCase())
    );

    if (newIndustry || newEmotion) {
      finalSelection.push(campaign);
      industries.add(campaign.industry);
      campaign.emotionalAppeal.forEach(e => emotionalAppeals.add(e));
    }

    if (finalSelection.length >= MAX_RESULTS) break;
  }

  for (const campaign of campaignsToInclude) {
    if (!finalSelection.includes(campaign)) {
      finalSelection.push(campaign);
    }
    if (finalSelection.length >= MAX_RESULTS) break;
  }

  if (finalSelection.length < MAX_RESULTS) {
    const remainingCount = MAX_RESULTS - finalSelection.length;
    const wildcards = selectRandomWildcardCampaigns(finalSelection, remainingCount);
    finalSelection.push(...wildcards);
  }

  return finalSelection.slice(0, MAX_RESULTS);
}

function selectRandomWildcardCampaigns(selectedCampaigns: Campaign[], count: number): Campaign[] {
  const selectedIds = new Set(selectedCampaigns.map(c => c.id));
  const selectedIndustries = new Set(selectedCampaigns.map(c => c.industry));

  const eligibleCampaigns = (campaigns as Campaign[])
    .filter(c => !selectedIds.has(c.id) && !selectedIndustries.has(c.industry));

  const shuffled = [...eligibleCampaigns].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
}