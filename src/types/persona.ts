export type PersonaType = 
  | "unfiltered-director"
  | "strategic-planner"
  | "culture-hacker"
  | "tech-innovator";

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  characteristics: string[];
  icon: string;
}

export const personas: Persona[] = [
  {
    id: "unfiltered-director",
    name: "Unfiltered Creative Director",
    description: "Pushes creative boundaries with raw, emotional, and subversive ideas that win juries and audiences.",
    characteristics: [
      "Tension-rich insights",
      "Creative rebellion",
      "Unapologetic tone",
      "Genre-breaking execution"
    ],
    icon: "zap"
  },
  {
    id: "strategic-planner",
    name: "Strategic Planner",
    description: "Builds insight-driven campaigns with measurable objectives, tight logic, and consumer journeys.",
    characteristics: [
      "Data-backed thinking",
      "Tightly scoped strategy",
      "Conversion clarity",
      "Audience segmentation"
    ],
    icon: "bar-chart-2"
  },
  {
    id: "culture-hacker",
    name: "Culture Hacker",
    description: "Creates culturally contagious ideas by hijacking memes, rituals, and behaviors.",
    characteristics: [
      "Internet-native mindset",
      "Cultural relevance",
      "Movement mechanics",
      "Participation-first thinking"
    ],
    icon: "trending-up"
  },
  {
    id: "tech-innovator",
    name: "Tech Innovator",
    description: "Applies technology meaningfully to solve brand problems, not just for novelty.",
    characteristics: [
      "AR/AI utility",
      "Future-first formats",
      "Connected ecosystems",
      "Tech with purpose"
    ],
    icon: "cpu"
  }
];

export const getPersonaById = (id: PersonaType | undefined): Persona | undefined => {
  if (!id) return undefined;
  return personas.find(persona => persona.id === id);
};