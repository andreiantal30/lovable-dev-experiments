import { BRAVERY_PATTERNS, calculateBraveryScore } from './evaluateCampaign';
import { GeneratedCampaign } from './types';

export async function enhanceBravery(
    campaign: GeneratedCampaign,
    brand: string,
    industry: string
  ): Promise<GeneratedCampaign> {
    const { score, breakdown } = calculateBraveryScore(campaign);
    
    if (score >= 6) return campaign;
  
    const enhanced = { ...campaign };
  
    if (!breakdown.physicalIntervention) {
      enhanced.executionPlan.push(
        `Stage a ${brand} intervention in public space (${getLocationForBrand(brand)})`
      );
    }
  
    if (!breakdown.challengesAuthority) {
      enhanced.keyMessage = `${enhanced.keyMessage} This directly challenges ${getAuthorityForIndustry(industry)}`;
    }
  
    return enhanced;
  }

// Helper functions
function getLocationForBrand(brand: string): string {
  const LOCATIONS = {
    tech: "Apple Store",
    finance: "bank branch",
    fashion: "luxury boutique"
  };
  return LOCATIONS[brand.toLowerCase()] || "public square";
}

function getAuthorityForIndustry(industry: string): string {
    const authorities = {
      tech: "Big Tech",
      education: "school systems",
      finance: "traditional banks",
      food: "health regulators",
      fashion: "beauty standards",
      travel: "border control"
    };
    return authorities[industry.toLowerCase()] || "the status quo";
  }