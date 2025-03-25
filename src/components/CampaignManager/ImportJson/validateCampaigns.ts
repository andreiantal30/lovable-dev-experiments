
import { Campaign } from '@/lib/campaignData';
import { v4 as uuidv4 } from 'uuid';

export const validateCampaigns = (data: any): Campaign[] => {
  if (!Array.isArray(data)) {
    throw new Error('JSON file must contain an array of campaigns');
  }
  
  return data.map((item: any) => {
    if (!item.name || !item.brand || !item.industry) {
      throw new Error('Each campaign must have name, brand, and industry fields');
    }
    
    const targetAudience = Array.isArray(item.targetAudience) ? item.targetAudience : [];
    const objectives = Array.isArray(item.objectives) ? item.objectives : [];
    const features = Array.isArray(item.features) ? item.features : [];
    const emotionalAppeal = Array.isArray(item.emotionalAppeal) ? item.emotionalAppeal : [];
    const outcomes = Array.isArray(item.outcomes) ? item.outcomes : [];
    
    return {
      id: item.id || uuidv4(),
      name: item.name,
      brand: item.brand,
      industry: item.industry,
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
