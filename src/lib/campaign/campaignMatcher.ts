
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
      return diversifyCampaignSelection(matchedCampaigns);
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
        return diversifyCampaignSelection(embeddingResults);
      }
    } catch (error) {
      console.error('Error with embedding-based matching:', error);
    }
  }

  console.log('Using traditional campaign matching');

  return diversifyCampaignSelection(findSimilarCampaignsTraditional(input));
};

/**
 * Traditional campaign matching algorithm with improved diversity
 */
export function findSimilarCampaignsTraditional(input: CampaignInput): Campaign[] {
  const inputSentiment = determineSentiment(input.emotionalAppeal);
  const inputTone = determineTone(input.objectives, input.emotionalAppeal);

  // Score all campaigns based on relevance criteria
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

  // Get a wider range of top campaigns for diversity
  const topScoring = scoredCampaigns.sort((a, b) => b.totalScore - a.totalScore).slice(0, 20);
  
  // Select campaigns with diverse characteristics
  return selectDiverseCampaigns(topScoring, 5).map(s => s.campaign);
}

/**
 * Select diverse campaigns from the top-scoring ones
 */
function selectDiverseCampaigns(scoredCampaigns: EnhancedSimilarityScore[], count: number): EnhancedSimilarityScore[] {
  const selected: EnhancedSimilarityScore[] = [];
  
  // Always include the top scoring campaign
  if (scoredCampaigns.length > 0) {
    selected.push(scoredCampaigns[0]);
  }

  // Then add diverse campaigns
  while (selected.length < count && selected.length < scoredCampaigns.length) {
    // Calculate the average dimension scores of already selected campaigns
    const avgDimensionScores: Record<string, number> = {};
    Object.keys(scoredCampaigns[0].dimensionScores).forEach(dimension => {
      avgDimensionScores[dimension] = selected.reduce(
        (sum, item) => sum + item.dimensionScores[dimension as keyof typeof item.dimensionScores],
        0
      ) / selected.length;
    });

    let bestComplement: EnhancedSimilarityScore | null = null;
    let bestComplementScore = -1;

    // Find campaigns that complement the already selected ones
    for (const candidate of scoredCampaigns) {
      if (selected.some(s => s.campaign.id === candidate.campaign.id)) continue;

      let complementScore = 0;
      let diversityScore = 0;
      
      // Check if this campaign adds diversity in dimensions where current selection is weak
      Object.entries(avgDimensionScores).forEach(([dimension, avgScore]) => {
        const dimensionKey = dimension as keyof typeof candidate.dimensionScores;
        if (avgScore < 7 && candidate.dimensionScores[dimensionKey] > avgScore) {
          complementScore += candidate.dimensionScores[dimensionKey] - avgScore;
        }
      });
      
      // Additional diversity bonus if industry or emotional appeal is different
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

    // Add the best complementary campaign
    if (bestComplement) {
      selected.push(bestComplement);
    } else {
      // If no good complement found, add next best scoring campaign
      const nextBest = scoredCampaigns.find(
        candidate => !selected.some(s => s.campaign.id === candidate.campaign.id)
      );
      if (nextBest) selected.push(nextBest);
      else break; // No more campaigns to add
    }
  }

  // Limit to the requested count
  return selected.slice(0, count);
}

/**
 * Ensure diversity in the final campaign selection
 */
function diversifyCampaignSelection(campaignsToInclude: Campaign[]): Campaign[] {
  const MAX_RESULTS = 5; // Increased from 3 to get more diverse examples
  const finalSelection: Campaign[] = [];
  
  // Include the top matches but make sure they're diverse
  const industries = new Set<string>();
  const emotionalAppeals = new Set<string>();

  // First pass: add campaigns that have unique industries or emotional appeals
  for (const campaign of campaignsToInclude) {
    // Check if this campaign adds diversity
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
  
  // Second pass: add remaining campaigns if we need more
  for (const campaign of campaignsToInclude) {
    if (!finalSelection.includes(campaign)) {
      finalSelection.push(campaign);
    }
    if (finalSelection.length >= MAX_RESULTS) break;
  }

  // Add wildcard campaigns from the full dataset for more diversity
  if (finalSelection.length < MAX_RESULTS) {
    const remainingCount = MAX_RESULTS - finalSelection.length;
    const wildcards = selectRandomWildcardCampaigns(finalSelection, remainingCount);
    finalSelection.push(...wildcards);
  }
  
  return finalSelection.slice(0, MAX_RESULTS);
}

/**
 * Select random wildcard campaigns that differ from those already selected
 */
function selectRandomWildcardCampaigns(selectedCampaigns: Campaign[], count: number): Campaign[] {
  const selectedIds = new Set(selectedCampaigns.map(c => c.id));
  const selectedIndustries = new Set(selectedCampaigns.map(c => c.industry));
  
  const eligibleCampaigns = (campaigns as Campaign[])
    .filter(c => !selectedIds.has(c.id) && !selectedIndustries.has(c.industry));
    
  // Shuffle eligible campaigns
  const shuffled = [...eligibleCampaigns].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count);
}
