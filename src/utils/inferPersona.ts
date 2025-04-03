import { CampaignInput } from '@/lib/campaign/types';
import { PersonaType } from '@/types/persona';

export function inferPersona(input: CampaignInput): PersonaType {
  const lowerObjectives = input.objectives.join(' ').toLowerCase();
  const emotion = input.emotionalAppeal.join(' ').toLowerCase();
  const industry = input.industry.toLowerCase();

  if (industry.includes('tech') || industry.includes('ai')) {
    return 'tech-innovator' as PersonaType;
  }

  if (emotion.includes('rebellion') || emotion.includes('urgency') || lowerObjectives.includes('break rules')) {
    return 'unfiltered-director' as PersonaType;
  }

  if (lowerObjectives.includes('movement') || lowerObjectives.includes('culture') || emotion.includes('belonging')) {
    return 'culture-hacker' as PersonaType;
  }

  if (lowerObjectives.includes('conversion') || lowerObjectives.includes('data') || emotion.includes('trust')) {
    return 'strategic-planner' as PersonaType;
  }

  return 'unfiltered-director' as PersonaType; // fallback
}