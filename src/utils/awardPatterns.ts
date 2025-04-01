
/**
 * Creative patterns commonly found in award-winning campaigns
 * Used to guide AI in generating more strategic and culturally-relevant campaigns
 */
export const creativePatternPrompt = `
Here are 10 award-winning campaign patterns. These represent common traits in successful, creative, and culture-shifting ideas. Use them as inspiration when crafting your campaign.

1. Flip the Script – Reframe a cultural norm or stereotype.
2. Reclaim the Trend – Take back a popular behavior or meme for real-world purpose.
3. Create Utility – Build a tool, app, or product from a pain point.
4. Hack the Medium – Use media spaces in unexpected ways.
5. Tap Hidden Emotions – Shine light on overlooked feelings.
6. Make the Invisible Visible – Show what's often ignored.
7. Invite Participation – Turn passive viewers into active players.
8. Champion Subcultures – Highlight niche or overlooked communities.
9. Redefine Value – Change how people think about worth, success, or beauty.
10. Product as Platform – Let the product itself spark cultural action.
`;

/**
 * Get a detailed explanation of a specific creative pattern
 * @param patternNumber - The pattern number (1-10)
 * @returns Detailed description of the pattern with examples
 */
export function getPatternDetail(patternNumber: number): string {
  const patterns = [
    {
      name: "Flip the Script",
      description: "Reframe a cultural norm or stereotype in a way that challenges perception.",
      examples: "Dove 'Real Beauty Sketches', Always 'Like a Girl', Libresse 'Blood Normal'"
    },
    {
      name: "Reclaim the Trend",
      description: "Take back a popular behavior or meme for meaningful purpose.",
      examples: "Truth's 'Swipe Left on Smoking', WWF's 'Last Selfie', Burger King 'Whopper Neutrality'"
    },
    {
      name: "Create Utility",
      description: "Build a tool, app, or product that solves a pain point.",
      examples: "Volvo 'Life Paint', Samsung 'Good Vibes', Google 'Project Euphonia'"
    },
    {
      name: "Hack the Medium",
      description: "Use media spaces in unexpected ways that surprise audiences.",
      examples: "Spotify 'Wrapped', Diesel's 'Hate Couture', KitKat 'Have a Break'"
    },
    {
      name: "Tap Hidden Emotions",
      description: "Shine light on overlooked feelings that resonate universally.",
      examples: "P&G 'Thank You Mom', Google 'Reunion', Gillette 'The Best Men Can Be'"
    },
    {
      name: "Make the Invisible Visible",
      description: "Show what's often ignored to create awareness and empathy.",
      examples: "The New York Times 'The Truth Is Hard to Find', IKEA 'Real Life Roomsets', Nike 'Dream Crazy'"
    },
    {
      name: "Invite Participation",
      description: "Turn passive viewers into active participants in the brand story.",
      examples: "Share a Coke, Ice Bucket Challenge, Domino's 'Paving for Pizza'"
    },
    {
      name: "Champion Subcultures",
      description: "Highlight niche or overlooked communities in authentic ways.",
      examples: "Microsoft 'Reindeer Games', Diesel 'Go With The Flaw', Under Armour 'I Will What I Want'"
    },
    {
      name: "Redefine Value",
      description: "Change how people think about worth, success, or beauty.",
      examples: "Patagonia 'Don't Buy This Jacket', Adidas 'Here to Create', Lexus 'Engineered by the Streets'"
    },
    {
      name: "Product as Platform",
      description: "Let the product itself spark cultural action or conversation.",
      examples: "LEGO 'Rebuild the World', Apple 'Shot on iPhone', Moldy Whopper"
    }
  ];

  // Return pattern detail or error message if pattern number is invalid
  if (patternNumber >= 1 && patternNumber <= patterns.length) {
    const pattern = patterns[patternNumber - 1];
    return `
Pattern ${patternNumber}: ${pattern.name}
Description: ${pattern.description}
Examples: ${pattern.examples}
`;
  } else {
    return "Invalid pattern number. Please choose a number between 1 and 10.";
  }
}
