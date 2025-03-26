
import { Campaign, campaignData, emotionalAppeals, objectives } from "./campaignData";

// Define insight categories with related keywords
export interface InsightCategory {
  name: string;
  count: number;
  keywords: string[];
  campaigns: string[];
  industries: string[];
  audiences: string[];
}

// Define the main insight patterns we want to identify
const insightPatterns = [
  {
    name: "Belonging & Identity",
    keywords: ["belonging", "identity", "community", "connection", "self", "recognition", "pride", "cultural", "inclusion"]
  },
  {
    name: "Control & Chaos",
    keywords: ["control", "chaos", "order", "power", "decision", "confidence", "uncertainty", "stability"]
  },
  {
    name: "Visibility & Shame",
    keywords: ["visibility", "shame", "seen", "hidden", "noticed", "ignored", "acceptance", "judgment", "empathy"]
  },
  {
    name: "Rebellion Against Structure",
    keywords: ["rebellion", "structure", "convention", "rules", "freedom", "independence", "challenge", "authority", "defiance"]
  },
  {
    name: "Joy & Pleasure",
    keywords: ["joy", "pleasure", "happiness", "fun", "excitement", "delight", "satisfaction", "celebration"]
  },
  {
    name: "Ambition & Achievement",
    keywords: ["ambition", "achievement", "success", "accomplishment", "goal", "determination", "recognition"]
  },
  {
    name: "Fear & Security",
    keywords: ["fear", "security", "safety", "protection", "threat", "comfort", "danger", "risk", "trust"]
  }
];

// Helper function to check if text contains any keyword from a list
const containsAnyKeyword = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

// Analyze campaigns and extract insight patterns
export function analyzeInsightPatterns(): InsightCategory[] {
  // Initialize results with our predefined patterns
  const results: InsightCategory[] = insightPatterns.map(pattern => ({
    name: pattern.name,
    count: 0,
    keywords: pattern.keywords,
    campaigns: [],
    industries: [],
    audiences: []
  }));

  // Analyze each campaign
  campaignData.forEach(campaign => {
    // Combine relevant fields for analysis
    const textToAnalyze = [
      campaign.keyMessage || "",
      campaign.strategy || "",
      ...(campaign.emotionalAppeal || []),
      ...(campaign.objectives || [])
    ].join(" ").toLowerCase();

    // Check each insight pattern
    results.forEach(pattern => {
      if (containsAnyKeyword(textToAnalyze, pattern.keywords)) {
        pattern.count++;
        pattern.campaigns.push(campaign.name);
        
        // Track industries
        if (campaign.industry && !pattern.industries.includes(campaign.industry)) {
          pattern.industries.push(campaign.industry);
        }
        
        // Track audiences
        campaign.targetAudience?.forEach(audience => {
          if (!pattern.audiences.includes(audience)) {
            pattern.audiences.push(audience);
          }
        });
      }
    });
  });

  // Sort by count in descending order
  return results.sort((a, b) => b.count - a.count);
}

// Get top industries and audiences for an insight category
export function getTopAssociations(category: InsightCategory, limit: number = 3): { 
  topIndustries: string[], 
  topAudiences: string[] 
} {
  return {
    topIndustries: category.industries.slice(0, limit),
    topAudiences: category.audiences.slice(0, limit)
  };
}
