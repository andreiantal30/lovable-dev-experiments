import {
    generateAtomicInsights,
    generateCreativeInsights
  } from '@lib/campaign/creativeInsightGenerator';
  import { CampaignInput } from '@lib/campaign/types';
  
  describe('Insight Generation', () => {
    // Complete mock input matching CampaignInput interface
    const mockInput: CampaignInput = {
      brand: "EcoApparel",
      industry: "Fashion",
      targetAudience: ["Activists"],
      emotionalAppeal: ["anger", "hope"],
      objectives: ["Increase sustainability awareness"], // Required field
      campaignStyle: "brand-activism",
      
      // Include other required fields from your CampaignInput
      additionalConstraints: "",
      brandPersonality: "Bold",
      differentiator: "Ethical manufacturing",
      culturalInsights: ""
    };
  
    const mockConfig = { apiKey: 'test', model: 'gpt-4' };
  
    test('Atomic Insights contain layer data', async () => {
      const insights = await generateAtomicInsights(mockInput, mockConfig);
      expect(insights[0].layer).toBeDefined();
    });
  
    test('Creative Insights build on atomic base', async () => {
      const insights = await generateCreativeInsights(mockInput, mockConfig);
      expect(insights[0].layer).toBeDefined();
      expect(insights[0].insightScore).toBeGreaterThan(5);
    });
  });