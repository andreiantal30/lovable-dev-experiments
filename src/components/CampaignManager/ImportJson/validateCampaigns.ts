
import { Campaign } from '@/lib/campaignData';
import { v4 as uuidv4 } from 'uuid';

export const validateCampaigns = (data: any): Campaign[] => {
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of campaigns');
  }
  
  return data.map((item: any, index: number) => {
    // Generate default values for required fields if they're missing
    const name = item.name || `Campaign ${index + 1}`;
    const brand = item.brand || 'Unknown Brand';
    const industry = item.industry || 'Other';
    
    const targetAudience = Array.isArray(item.targetAudience) ? item.targetAudience : [];
    const objectives = Array.isArray(item.objectives) ? item.objectives : [];
    const features = Array.isArray(item.features) ? item.features : [];
    const emotionalAppeal = Array.isArray(item.emotionalAppeal) ? item.emotionalAppeal : [];
    const outcomes = Array.isArray(item.outcomes) ? item.outcomes : [];
    
    return {
      id: item.id || uuidv4(),
      name,
      brand,
      industry,
      year: item.year || new Date().getFullYear(),
      keyMessage: item.keyMessage || '',
      strategy: item.strategy || '',
      targetAudience,
      objectives,
      features,
      emotionalAppeal,
      outcomes,
      viralElement: item.viralElement || '',
      creativeActivation: item.creativeActivation || ''
    } as Campaign;
  });
};
