
import { v4 as uuidv4 } from "uuid";

export interface CulturalTrend {
  id: string;
  title: string;
  description: string;
  source: string;
  platformTags: string[];
  category: string;
  addedOn: Date;
}

// Initial sample data
export const culturalTrends: CulturalTrend[] = [
  {
    id: uuidv4(),
    title: "AI as Identity",
    description: "Young users are forming emotional attachments with AI influencers, blurring real vs. synthetic relationships. This signals a shift in how Gen Z views authenticity and connection in the digital age.",
    source: "NewsAPI",
    platformTags: ["TikTok", "AI", "Social Media"],
    category: "Tech & Identity",
    addedOn: new Date()
  },
  {
    id: uuidv4(),
    title: "Sustainable Swapping",
    description: "Climate-conscious Gen Z is abandoning fast fashion for clothing swaps and secondhand marketplaces. Brands need to emphasize circularity and longevity in their product narratives.",
    source: "NewsAPI",
    platformTags: ["Sustainability", "Fashion", "Commerce"],
    category: "Sustainability",
    addedOn: new Date()
  },
  {
    id: uuidv4(),
    title: "Digital Mental Health Rituals",
    description: "The rise of mental health journaling on social platforms points to a desire for structured wellness routines that can be shared with communities. Brands can create tools and spaces facilitating these digital mental health rituals.",
    source: "NewsAPI",
    platformTags: ["TikTok", "Wellness", "Community"],
    category: "Mental Health",
    addedOn: new Date()
  }
];

// Get cached trends from localStorage if available
export function getCachedCulturalTrends(): CulturalTrend[] {
  try {
    const cached = localStorage.getItem("cultural_trends_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Convert string dates back to Date objects
      return parsed.map((trend: any) => ({
        ...trend,
        addedOn: new Date(trend.addedOn)
      }));
    }
  } catch (error) {
    console.error("Error loading cached trends:", error);
  }
  return culturalTrends;
}

// Save updated trends to cache
export function updateCachedCulturalTrends(trends: CulturalTrend[]): void {
  localStorage.setItem("cultural_trends_cache", JSON.stringify(trends));
}
