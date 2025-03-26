
/**
 * Extracts JSON from a potentially markdown-formatted string
 */
export const extractJsonFromResponse = (text: string): string => {
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return text.trim();
};
