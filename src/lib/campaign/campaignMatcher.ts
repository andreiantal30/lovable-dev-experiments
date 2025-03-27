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

/**
 * Find similar campaigns using different matching strategies
 */
export const findSimilarCampaigns = async (
  input: CampaignInput,
  openAIConfig: OpenAIConfig = { apiKey: '', model: 'gpt-4o' }
): Promise<Campaign[]> => {
  try {
    console.log('Using new reference campaign matcher');
    const matchedCampaigns = matchReferenceCampaigns(input);

    if (matchedCampaigns && matchedCampaigns.length > 0) {
      console.log('Found matches using new reference campaign matcher:', matchedCampaigns.map(c => c.name));
      return addDiversityBonus(matchedCampaigns);
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
        return addDiversityBonus(embeddingResults);
      }
    } catch (error) {
      console.error('Error with embedding-based matching:', error);
    }
  }

  console.log('Using traditional campaign matching');

  return addDiversityBonus(findSimilarCampaignsTraditional(input));
};

/**
 * Traditional campaign matching algorithm
 */
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

  const topScoring = scoredCampaigns.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
  const selected: EnhancedSimilarityScore[] = [];
  selected.push(topScoring[0]);

  while (selected.length < 3 && selected.length < topScoring.length) {
    const avgDimensionScores: Record<string, number> = {};
    Object.keys(topScoring[0].dimensionScores).forEach(dimension => {
      avgDimensionScores[dimension] = selected.reduce(
        (sum, item) => sum + item.dimensionScores[dimension as keyof typeof item.dimensionScores],
        0
      ) / selected.length;
    });

    let bestComplement: EnhancedSimilarityScore | null = null;
    let bestComplementScore = -1;

    for (const candidate of topScoring) {
      if (selected.some(s => s.campaign.id === candidate.campaign.id)) continue;

      let complementScore = 0;
      Object.entries(avgDimensionScores).forEach(([dimension, avgScore]) => {
        const dimensionKey = dimension as keyof typeof candidate.dimensionScores;
        if (avgScore < 7 && candidate.dimensionScores[dimensionKey] > avgScore) {
          complementScore += candidate.dimensionScores[dimensionKey] - avgScore;
        }
      });

      if (complementScore > bestComplementScore) {
        bestComplementScore = complementScore;
        bestComplement = candidate;
      }
    }

    if (bestComplement) {
      selected.push(bestComplement);
    } else {
      const nextBest = topScoring.find(
        candidate => !selected.some(s => s.campaign.id === candidate.campaign.id)
      );
      if (nextBest) selected.push(nextBest);
    }
  }

  console.log('Traditional campaign selection:', selected.map(s => ({
    name: s.campaign.name,
    score: s.totalScore,
    dimensions: s.dimensionScores
  })));

  return selected.map(s => s.campaign);
}
function addDiversityBonus(campaignsToInclude: Campaign[]): Campaign[] {
  const MAX_RESULTS = 3;

  // Always include the top 2 matches
  const selected = campaignsToInclude.slice(0, 2);

  // Inject 1 wildcard campaign that differs in tone, industry, or audience
  const remaining = (campaigns as Campaign[]).filter(c => 
    !selected.some(sel => sel.id === c.id)
  );

  const wildcard = remaining.find(c => {
    return (
      !selected.some(sel =>
        sel.industry === c.industry ||
        sel.targetAudience.some(a => c.targetAudience.includes(a)) ||
        sel.objectives.some(o => c.objectives.includes(o))
      )
    );
  });

  if (wildcard) {
    selected.push(wildcard);
  } else {
    // Fallback: just fill up to 3
    selected.push(...campaignsToInclude.slice(2, MAX_RESULTS));
  }

  return selected.slice(0, MAX_RESULTS);
}