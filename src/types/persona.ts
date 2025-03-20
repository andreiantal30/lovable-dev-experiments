
export type PersonaType = 
  | "bold-risk-taker" 
  | "safe-brand-builder" 
  | "viral-trend-expert" 
  | "storytelling-artist" 
  | "data-driven-strategist";

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  characteristics: string[];
  icon: string;
}

export const personas: Persona[] = [
  {
    id: "bold-risk-taker",
    name: "Bold Risk-Taker",
    description: "Creates attention-grabbing campaigns that push boundaries and challenge conventions",
    characteristics: [
      "Disruptive ideas",
      "Unexpected twists",
      "Conversation starters",
      "Boundary-pushing concepts"
    ],
    icon: "zap"
  },
  {
    id: "safe-brand-builder",
    name: "Safe Brand Builder",
    description: "Focuses on long-term brand equity with reliable, proven campaign approaches",
    characteristics: [
      "Consistent messaging",
      "Proven strategies",
      "Brand integrity",
      "Sustainable growth"
    ],
    icon: "shield"
  },
  {
    id: "viral-trend-expert",
    name: "Viral Trend Expert",
    description: "Specializes in campaigns designed to spread rapidly through social networks",
    characteristics: [
      "Shareable content",
      "Cultural relevance",
      "Platform optimization",
      "Engagement triggers"
    ],
    icon: "trending-up"
  },
  {
    id: "storytelling-artist",
    name: "Storytelling Artist",
    description: "Crafts emotionally resonant narratives that connect deeply with audiences",
    characteristics: [
      "Emotional narratives",
      "Character development",
      "Memorable journeys",
      "Authentic connections"
    ],
    icon: "book-open"
  },
  {
    id: "data-driven-strategist",
    name: "Data-Driven Strategist",
    description: "Leverages insights and metrics to create highly targeted, effective campaigns",
    characteristics: [
      "Audience targeting",
      "Performance metrics",
      "Conversion optimization",
      "A/B testing elements"
    ],
    icon: "bar-chart-2"
  }
];

export const getPersonaById = (id: PersonaType | undefined): Persona | undefined => {
  if (!id) return undefined;
  return personas.find(persona => persona.id === id);
};
