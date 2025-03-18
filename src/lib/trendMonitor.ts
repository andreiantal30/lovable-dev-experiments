
import { toast } from "sonner";

export interface TrendData {
  id: string;
  keyword: string;
  industry: string;
  popularity: number; // 1-100 scale
  source: "twitter" | "google" | "reddit" | "industry" | "other";
  description: string;
  dateAdded: Date;
  relatedTags: string[];
}

// This would be replaced with actual API calls to trend data sources
// For now, we'll simulate with static data
const mockTrendData: TrendData[] = [
  {
    id: "1",
    keyword: "Sustainability",
    industry: "Retail",
    popularity: 92,
    source: "industry",
    description: "Environmental impact and sustainable practices are dominating consumer conversations",
    dateAdded: new Date("2023-10-15"),
    relatedTags: ["eco-friendly", "zero-waste", "carbon-neutral"]
  },
  {
    id: "2",
    keyword: "Authenticity",
    industry: "Food & Beverage",
    popularity: 87,
    source: "twitter",
    description: "Consumers are connecting with brands that show their authentic side and values",
    dateAdded: new Date("2023-09-28"),
    relatedTags: ["transparency", "behind-the-scenes", "brand-story"]
  },
  {
    id: "3",
    keyword: "Interactive AR",
    industry: "Technology",
    popularity: 78,
    source: "industry",
    description: "Augmented reality experiences are creating new ways for brands to engage audiences",
    dateAdded: new Date("2023-10-05"),
    relatedTags: ["augmented-reality", "interactive-content", "immersive"]
  },
  {
    id: "4",
    keyword: "User-Generated Content",
    industry: "Entertainment",
    popularity: 85,
    source: "reddit",
    description: "Brands leveraging content created by their community are seeing higher engagement",
    dateAdded: new Date("2023-10-12"),
    relatedTags: ["ugc", "community", "content-creation"]
  },
  {
    id: "5",
    keyword: "Micro-Influencers",
    industry: "Fashion",
    popularity: 81,
    source: "twitter",
    description: "Smaller influencers with dedicated followings are driving authentic engagement",
    dateAdded: new Date("2023-10-02"),
    relatedTags: ["influencer-marketing", "niche-audience", "authenticity"]
  },
  {
    id: "6",
    keyword: "Voice Search",
    industry: "E-commerce",
    popularity: 73,
    source: "google",
    description: "Optimizing content for voice search is becoming essential as voice assistants grow",
    dateAdded: new Date("2023-09-20"),
    relatedTags: ["voice-assistant", "seo", "conversational-ai"]
  },
  {
    id: "7",
    keyword: "Nostalgia Marketing",
    industry: "Advertising",
    popularity: 79,
    source: "industry",
    description: "Brands connecting with consumers through nostalgia and retro concepts",
    dateAdded: new Date("2023-10-08"),
    relatedTags: ["retro", "throwback", "emotional-connection"]
  },
  {
    id: "8",
    keyword: "Social Responsibility",
    industry: "Any",
    popularity: 90,
    source: "twitter",
    description: "Customers expect brands to take stands on social issues and contribute positively",
    dateAdded: new Date("2023-10-10"),
    relatedTags: ["corporate-responsibility", "social-impact", "cause-marketing"]
  },
  {
    id: "9",
    keyword: "Short-Form Video",
    industry: "Social Media",
    popularity: 95,
    source: "industry",
    description: "Brief, engaging video content continues to dominate social platforms",
    dateAdded: new Date("2023-10-01"),
    relatedTags: ["tiktok", "reels", "shorts", "video-content"]
  },
  {
    id: "10",
    keyword: "Personalization",
    industry: "Marketing",
    popularity: 88,
    source: "google",
    description: "Tailored messaging and experiences that make consumers feel understood",
    dateAdded: new Date("2023-09-25"),
    relatedTags: ["custom-experience", "data-driven", "individual-approach"]
  }
];

// In a real implementation, this would connect to external APIs
// to get real-time trend data from Twitter, Google Trends, etc.

export const getTrendingTopics = async (industry: string, limit: number = 3): Promise<TrendData[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter trends by industry (if provided) or get general trends
    let trends = mockTrendData;
    
    if (industry && industry !== "Any") {
      // Get specific industry trends, falling back to general ones if not enough
      const industryTrends = mockTrendData.filter(trend => 
        trend.industry.toLowerCase() === industry.toLowerCase() || 
        trend.industry === "Any"
      );
      
      // If we don't have enough industry-specific trends, add some general ones
      if (industryTrends.length < limit) {
        trends = [
          ...industryTrends,
          ...mockTrendData.filter(trend => 
            trend.industry !== industry && trend.industry === "Any"
          ).slice(0, limit - industryTrends.length)
        ];
      } else {
        trends = industryTrends;
      }
    }
    
    // Sort by popularity and recency
    trends = trends.sort((a, b) => {
      // Prioritize popularity first
      if (b.popularity !== a.popularity) {
        return b.popularity - a.popularity;
      }
      // Then by recency
      return b.dateAdded.getTime() - a.dateAdded.getTime();
    });
    
    return trends.slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    toast.error("Could not fetch trending topics");
    return [];
  }
};

// For incorporating trends into campaign generation
export const createTrendPrompt = (trends: TrendData[]): string => {
  if (!trends.length) return "";
  
  const trendDescriptions = trends.map(trend => 
    `- ${trend.keyword}: ${trend.description} (Related: ${trend.relatedTags.join(', ')})`
  ).join('\n');
  
  return `
Consider incorporating these current trending topics into the campaign where relevant:
${trendDescriptions}

These trends are currently gaining traction with audiences and may help the campaign resonate more effectively.
`;
};
