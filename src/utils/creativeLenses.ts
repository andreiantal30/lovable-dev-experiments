
import { ArrowRight, Users, RotateCw, Clock, Eye } from "lucide-react";

export type CreativeLens = 
  | 'flip-the-trend'
  | 'co-create'
  | 'brand-role-reversal'
  | 'ritual-hacking'
  | 'invisible-problem';

export interface LensDetails {
  id: CreativeLens;
  name: string;
  description: string;
  promptGuidance: string;
  icon: React.ElementType;
}

export const creativeLenses: LensDetails[] = [
  {
    id: 'flip-the-trend',
    name: 'Flip the Trend',
    description: 'Turn a current behavior or cultural norm on its head',
    promptGuidance: 'Identify a common behavior, belief, or cultural norm that your target audience follows, then create a campaign that completely flips or reverses this expectation in a thought-provoking way.',
    icon: ArrowRight
  },
  {
    id: 'co-create',
    name: 'Co-Create',
    description: 'Let the audience actively shape or build the brand message',
    promptGuidance: 'Design a campaign structure where the audience doesn\'t just consume but actively participates in creating the message, content, or experience, giving them meaningful creative control and ownership.',
    icon: Users
  },
  {
    id: 'brand-role-reversal',
    name: 'Brand Role Reversal',
    description: 'Make the brand behave in an unexpected way',
    promptGuidance: 'Identify the typical persona or behavior expected from this brand or industry, then create a campaign where the brand behaves in a completely unexpected or opposite manner that creates surprise and delight.',
    icon: RotateCw
  },
  {
    id: 'ritual-hacking',
    name: 'Ritual Hacking',
    description: 'Put a creative twist on a daily or cultural routine',
    promptGuidance: 'Identify a common daily routine, habit, or cultural ritual that your audience practices, then create a campaign that introduces a creative twist or reimagination of how this routine can be experienced.',
    icon: Clock
  },
  {
    id: 'invisible-problem',
    name: 'Invisible Problem',
    description: 'Solve an issue people experience but rarely talk about',
    promptGuidance: 'Identify a common but rarely discussed problem, frustration, or tension your audience experiences, then create a campaign that brings this issue to light in a way that resonates deeply and positions your brand as the solution.',
    icon: Eye
  }
];

export const getCreativeLensById = (id: CreativeLens | undefined): LensDetails | undefined => {
  if (!id) return undefined;
  return creativeLenses.find(lens => lens.id === id);
};

// Add a function to get a random creative lens
export const getRandomCreativeLens = (): LensDetails => {
  const randomIndex = Math.floor(Math.random() * creativeLenses.length);
  return creativeLenses[randomIndex];
};
