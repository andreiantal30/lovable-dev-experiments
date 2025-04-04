import { calculateBraveryScore } from '../lib/campaign/evaluateCampaign';

describe('Bravery Scoring System', () => {
  // Physical Interventions
  test('Scores 2 points for physical interventions', () => {
    const campaign = {
      strategy: 'Occupy bank branches',
      keyMessage: 'We demand transparency',
      executionPlan: ['Stage sit-ins at 10 major banks']
    };
    expect(calculateBraveryScore(campaign)).toBe(2);
  });

  test('Scores 3 points for institutional targeting', () => {
    const campaign = {
      strategy: 'Challenge university policies',
      keyMessage: 'End student debt slavery',
      executionPlan: ['Confront board of trustees']
    };
    expect(calculateBraveryScore(campaign)).toBe(3);
  });

  test('Scores 1.5 points for personal risk', () => {
    const campaign = {
      strategy: 'Employee confessions',
      keyMessage: 'Our CEO lies',
      executionPlan: ['Workers expose company secrets']
    };
    expect(calculateBraveryScore(campaign)).toBe(1.5);
  });

  test('Deducts 2 points for clichés', () => {
    const campaign = {
      strategy: 'Hashtag activism',
      keyMessage: 'Sign our petition',
      executionPlan: ['Twitter storm with #ChangeNothing']
    };
    expect(calculateBraveryScore(campaign)).toBe(-2);
  });

  test('Combines scores for complex campaigns', () => {
    const campaign = {
      strategy: 'Occupy government buildings while exposing personal corruption',
      keyMessage: 'We know your secrets',
      executionPlan: [
        'Physical takeover of ministry HQ',
        'Public confession wall',
        'Avoid petitions and murals'
      ]
    };
    // Physical (2) + Institutional (3) + Personal (1.5) = 6.5
    expect(calculateBraveryScore(campaign)).toBe(6.5);
  });

  test('Returns 0 for safe campaigns', () => {
    const campaign = {
      strategy: 'Digital awareness',
      keyMessage: 'Be kind online',
      executionPlan: ['Instagram filters']
    };
    expect(calculateBraveryScore(campaign)).toBe(0);
  });

  test('Handles minimum score of 0', () => {
    const campaign = {
      strategy: 'Hashtags and murals',
      keyMessage: 'Very safe petition',
      executionPlan: ['#PleaseNoticeUs', 'Community mural']
    };
    // Cliché penalty (-2 * 2) but floors at 0
    expect(calculateBraveryScore(campaign)).toBe(0);
  });

  // Edge Cases
  test('Handles empty execution plans', () => {
    const campaign = {
      strategy: '',
      keyMessage: '',
      executionPlan: []
    };
    expect(calculateBraveryScore(campaign)).toBe(0);
  });

  test('Detects institutional targeting in key message', () => {
    const campaign = {
      strategy: 'Digital campaign',
      keyMessage: 'The police are lying to you',
      executionPlan: ['Social media posts']
    };
    expect(calculateBraveryScore(campaign)).toBe(3);
  });

  test('Detects physical interventions in strategy', () => {
    const campaign = {
      strategy: 'Vandalize corporate artwork',
      keyMessage: 'Art should be free',
      executionPlan: ['Gallery interventions']
    };
    expect(calculateBraveryScore(campaign)).toBe(2);
  });
});