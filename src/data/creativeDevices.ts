export interface CreativeDevice {
  name: string;
  description: string;
  exampleUsage?: string;
}

export const creativeDevices: CreativeDevice[] = [
  {
    name: "Flip the Familiar",
    description: "Take a common behavior, ritual, or truth and turn it upside down to spark surprise or tension.",
    exampleUsage: "Everyone flexes wins online — a campaign that celebrates failure instead."
  },
  {
    name: "Hyper-Targeting",
    description: "Create media or assets designed for one person or a hyper-specific micro-audience.",
    exampleUsage: "Spotify made a campaign that addressed only one fan of a specific artist."
  },
  {
    name: "Disappearing Content",
    description: "Build FOMO by making content, products, or experiences temporary, like stories or drops.",
    exampleUsage: "A limited filter that disappears after 48 hours — users must act or miss out."
  },
  {
    name: "Unexpected Use of Tech",
    description: "Use technology in a way that wasn't originally intended, surprising users with its recontextualization.",
    exampleUsage: "Using CAPTCHA tests to crowdsource poetry."
  },
  {
    name: "Outsourced Copywriting",
    description: "Let your audience generate the headlines, taglines, or full creative for the brand.",
    exampleUsage: "TikTok users write the campaign slogan in real-time."
  },
  {
    name: "Brand as Utility",
    description: "Transform your brand into a useful tool or service that solves a real problem.",
    exampleUsage: "A sports brand creates an app that turns city maps into running routes."
  },
  {
    name: "Cultural Hijacking",
    description: "Insert your brand into an existing cultural moment, trend, or conversation.",
    exampleUsage: "A food brand creates content that piggybacks on a viral dance challenge."
  },
  {
    name: "Media Hacking",
    description: "Use traditional media in non-traditional ways that subvert expectations.",
    exampleUsage: "Using billboards as physical Instagram frames that people can pose with."
  },
  {
    name: "Reality Distortion",
    description: "Create illusions, tricks, or perceptual shifts that make people question what they're seeing.",
    exampleUsage: "A 3D street art installation that appears to create a portal in the ground."
  },
  {
    name: "Participatory Storytelling",
    description: "Let your audience help shape or create the narrative as it unfolds.",
    exampleUsage: "A brand story that evolves based on audience votes or contributions on social media."
  }
];

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

export function getCreativeDevicesForStyle(campaignStyle?: string, count: number = 2): CreativeDevice[] {
  const styleDeviceMap: Record<string, string[]> = {
    "digital": ["Unexpected Use of Tech", "Disappearing Content", "Participatory Storytelling"],
    "experiential": ["Reality Distortion", "Media Hacking", "Brand as Utility"],
    "social": ["Cultural Hijacking", "Outsourced Copywriting", "Participatory Storytelling"],
    "influencer": ["Hyper-Targeting", "Outsourced Copywriting", "Cultural Hijacking"],
    "guerrilla": ["Media Hacking", "Reality Distortion", "Flip the Familiar"],
    "stunt": ["Reality Distortion", "Cultural Hijacking", "Media Hacking"],
    "UGC": ["Outsourced Copywriting", "Participatory Storytelling", "Hyper-Targeting"],
    "brand-activism": ["Flip the Familiar", "Media Hacking", "Brand as Utility"],
    "branded-entertainment": ["Participatory Storytelling", "Cultural Hijacking", "Reality Distortion"],
    "retail-activation": ["Reality Distortion", "Brand as Utility", "Media Hacking"],
    "data-personalization": ["Hyper-Targeting", "Brand as Utility", "Unexpected Use of Tech"],
    "real-time": ["Cultural Hijacking", "Participatory Storytelling", "Disappearing Content"],
    "ooh-ambient": ["Reality Distortion", "Media Hacking", "Flip the Familiar"],
    "ar-vr": ["Unexpected Use of Tech", "Reality Distortion", "Brand as Utility"]
  };

  let matches = campaignStyle && styleDeviceMap[campaignStyle]
    ? shuffle(
        creativeDevices.filter(d => styleDeviceMap[campaignStyle!].includes(d.name))
      ).slice(0, count)
    : [];

  const remaining = count - matches.length;
  if (remaining > 0) {
    const remainingDevices = shuffle(
      creativeDevices.filter(d => !matches.some(m => m.name === d.name))
    ).slice(0, remaining);
    matches = [...matches, ...remainingDevices];
  }

  return matches;
}

export function formatCreativeDevicesForPrompt(devices: CreativeDevice[]): string {
  if (!devices.length) return "";
  return `
#### **Creative Devices to Consider**

Consider using the following creative mechanics in your execution:
${devices.map(d => `- **${d.name}**: ${d.description}`).join('\n')}`;
}

export function getRandomCreativeDevices(count: number = 2): CreativeDevice[] {
  return shuffle(creativeDevices).slice(0, count);
}
