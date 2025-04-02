import { GeneratedCampaign } from '@/lib/generateCampaign';

type EvaluationKey = keyof NonNullable<GeneratedCampaign['evaluation']>;
type ScoreBlock = { score: number; comment?: string };

export function getEvaluationScore(
  evalData: GeneratedCampaign['evaluation'],
  key: EvaluationKey
): number | null {
  const raw = evalData?.[key];
  if (
    raw &&
    typeof raw === 'object' &&
    'score' in raw &&
    typeof (raw as ScoreBlock).score === 'number'
  ) {
    return (raw as ScoreBlock).score;
  }
  return null;
}
