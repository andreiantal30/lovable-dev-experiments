import { calculateBraveryScore } from '../lib/campaign/evaluateCampaign';

test('Scores physical interventions', () => {
  const campaign = {
    campaignName: 'ATM Hijack',
    keyMessage: 'Expose real banking fees',
    executionPlan: ["Hijack bank ATMs to display real fees"]
  };

  const result = calculateBraveryScore(campaign);

  expect(result.score).toBeGreaterThan(2); // or toEqual(3)
  expect(result.breakdown.physicalIntervention).toBe(true);
});