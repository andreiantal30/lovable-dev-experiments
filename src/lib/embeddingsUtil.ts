
import { OpenAIConfig } from './openai';
import { Campaign } from './campaignData';
import { CampaignInput } from './generateCampaign';
import { toast } from "sonner";

// Interface for storing campaign embeddings
export interface CampaignEmbedding {
  campaignId: string;
  embedding: number[];
}

// Storage key for embeddings
const EMBEDDINGS_STORAGE_KEY = 'campaign-embeddings';

/**
 * Generates an embedding for a text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string, config: OpenAIConfig): Promise<number[]> {
  if (!config.apiKey) {
    throw new Error("OpenAI API key is not provided");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Error generating embedding");
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("OpenAI Embedding API error:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Create a text representation of a campaign for embedding
 */
export function createCampaignEmbeddingText(campaign: Campaign): string {
  return `
    Brand: ${campaign.brand}
    Industry: ${campaign.industry}
    Target Audience: ${campaign.targetAudience.join(', ')}
    Objectives: ${campaign.objectives.join(', ')}
    Key Message: ${campaign.keyMessage}
    Strategy: ${campaign.strategy}
    Emotional Appeal: ${campaign.emotionalAppeal.join(', ')}
    ${campaign.creativeActivation ? `Creative Activation: ${campaign.creativeActivation}` : ''}
    ${campaign.viralElement ? `Viral Element: ${campaign.viralElement}` : ''}
  `;
}

/**
 * Create a text representation of campaign input for embedding
 */
export function createInputEmbeddingText(input: CampaignInput): string {
  return `
    Brand: ${input.brand}
    Industry: ${input.industry}
    Target Audience: ${input.targetAudience.join(', ')}
    Objectives: ${input.objectives.join(', ')}
    Emotional Appeal: ${input.emotionalAppeal.join(', ')}
    ${input.brandPersonality ? `Brand Personality: ${input.brandPersonality}` : ''}
    ${input.differentiator ? `Differentiator: ${input.differentiator}` : ''}
    ${input.culturalInsights ? `Cultural Insights: ${input.culturalInsights}` : ''}
    ${input.campaignStyle ? `Campaign Style: ${input.campaignStyle}` : ''}
    ${input.additionalConstraints ? `Additional Constraints: ${input.additionalConstraints}` : ''}
  `;
}

/**
 * Save embeddings to local storage
 */
export function saveEmbeddings(embeddings: CampaignEmbedding[]): boolean {
  try {
    localStorage.setItem(EMBEDDINGS_STORAGE_KEY, JSON.stringify(embeddings));
    return true;
  } catch (error) {
    console.error('Error saving embeddings:', error);
    return false;
  }
}

/**
 * Get embeddings from local storage
 */
export function getEmbeddings(): CampaignEmbedding[] {
  try {
    const storedEmbeddings = localStorage.getItem(EMBEDDINGS_STORAGE_KEY);
    if (storedEmbeddings) {
      return JSON.parse(storedEmbeddings);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving embeddings:', error);
    return [];
  }
}

/**
 * Generate embeddings for all campaigns
 */
export async function generateCampaignEmbeddings(
  campaigns: Campaign[], 
  config: OpenAIConfig
): Promise<CampaignEmbedding[]> {
  const embeddings: CampaignEmbedding[] = [];
  
  try {
    // Process campaigns in batches to avoid rate limits
    const batchSize = 10;
    let processed = 0;
    
    for (let i = 0; i < campaigns.length; i += batchSize) {
      const batch = campaigns.slice(i, i + batchSize);
      
      // Process this batch in parallel
      const batchPromises = batch.map(async (campaign) => {
        const text = createCampaignEmbeddingText(campaign);
        const embedding = await generateEmbedding(text, config);
        return {
          campaignId: campaign.id,
          embedding
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
      
      processed += batch.length;
      console.log(`Generated embeddings for ${processed}/${campaigns.length} campaigns`);
      
      // Wait a bit between batches to avoid rate limits
      if (i + batchSize < campaigns.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Save the embeddings to storage
    saveEmbeddings(embeddings);
    return embeddings;
  } catch (error) {
    console.error('Error generating campaign embeddings:', error);
    toast.error('Failed to generate campaign embeddings');
    throw error;
  }
}

/**
 * Find similar campaigns using embeddings and cosine similarity
 */
export async function findSimilarCampaignsWithEmbeddings(
  input: CampaignInput,
  allCampaigns: Campaign[],
  config: OpenAIConfig,
  numberOfResults: number = 3
): Promise<Campaign[]> {
  try {
    // Check if we have stored embeddings
    let campaignEmbeddings = getEmbeddings();
    
    // If we don't have enough embeddings, generate them
    if (campaignEmbeddings.length < allCampaigns.length * 0.8) {
      toast.info('Generating campaign embeddings. This might take a moment...');
      campaignEmbeddings = await generateCampaignEmbeddings(allCampaigns, config);
    }
    
    // Generate embedding for the input
    const inputText = createInputEmbeddingText(input);
    const inputEmbedding = await generateEmbedding(inputText, config);
    
    // Calculate similarity scores for each campaign
    const campaignsWithScores = allCampaigns
      .map(campaign => {
        // Find the embedding for this campaign
        const campaignEmbeddingObj = campaignEmbeddings.find(
          emb => emb.campaignId === campaign.id
        );
        
        if (!campaignEmbeddingObj) {
          // If we don't have an embedding for this campaign, give it a low score
          return { campaign, score: 0 };
        }
        
        // Calculate cosine similarity
        const similarity = cosineSimilarity(inputEmbedding, campaignEmbeddingObj.embedding);
        return { campaign, score: similarity };
      })
      .sort((a, b) => b.score - a.score) // Sort by highest similarity
      .slice(0, numberOfResults); // Get top N results
    
    console.log('Embedding-based campaign selection:', campaignsWithScores.map(s => ({
      name: s.campaign.name,
      score: s.score.toFixed(4)
    })));
    
    return campaignsWithScores.map(item => item.campaign);
  } catch (error) {
    console.error('Error finding similar campaigns with embeddings:', error);
    // Fallback to traditional method if embedding fails
    toast.error('Embeddings matching failed, falling back to standard matching');
    return null;
  }
}
