
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

/**
 * Get random creative devices from the list
 * @param count Number of devices to get
 * @returns Array of creative devices
 */
export function getRandomCreativeDevices(count: number = 2): CreativeDevice[] {
  if (count >= creativeDevices.length) {
    return [...creativeDevices];
  }
  
  const shuffled = [...creativeDevices].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get creative devices that might work well with a specific campaign style
 * @param campaignStyle The campaign style to match
 * @param count Number of devices to get
 * @returns Array of creative devices
 */
export function getCreativeDevicesForStyle(campaignStyle?: string, count: number = 2): CreativeDevice[] {
  if (!campaignStyle) {
    return getRandomCreativeDevices(count);
  }
  
  // Map campaign styles to creative devices that work well with them
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
  
  if (styleDeviceMap[campaignStyle]) {
    // Get devices matching this style
    const matchingDeviceNames = styleDeviceMap[campaignStyle];
    const matchingDevices = creativeDevices.filter(device => 
      matchingDeviceNames.includes(device.name)
    );
    
    // If we have enough matching devices, shuffle and return the requested count
    if (matchingDevices.length >= count) {
      return matchingDevices.sort(() => 0.5 - Math.random()).slice(0, count);
    }
    
    // If we don't have enough matches, get the matches we have and fill with random others
    const remainingCount = count - matchingDevices.length;
    const otherDevices = creativeDevices
      .filter(device => !matchingDeviceNames.includes(device.name))
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);
    
    return [...matchingDevices, ...otherDevices];
  }
  
  // Default to random if no specific mapping
  return getRandomCreativeDevices(count);
}

/**
 * Format creative devices for inclusion in a prompt
 * @param devices Array of creative devices
 * @returns Formatted string for prompt inclusion
 */
export function formatCreativeDevicesForPrompt(devices: CreativeDevice[]): string {
  if (!devices || devices.length === 0) {
    return "";
  }
  
  return `
#### **Creative Devices to Consider**

Consider using the following creative mechanics in your execution:
${devices.map(device => `- **${device.name}**: ${device.description}`).join('\n')}
`;
}
