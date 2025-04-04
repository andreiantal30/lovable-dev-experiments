/**
 * Enhanced utilities for campaign generation
 */

interface TextWithJson {
  text: string;
  json?: any;
  error?: string;
}

/**
 * Extracts and validates JSON from mixed content responses
 * with improved error handling and markdown support
 */
export function extractJsonFromResponse(raw: string): string {
  // Pre-clean common GPT artifacts
  const preprocessed = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/^[\s]*"|"[\s]*$/g, '') // Remove wrapping quotes
    .trim();

  // Attempt direct parse first
  try {
    JSON.parse(preprocessed);
    return preprocessed;
  } catch (e) {
    // Fallback 1: Extract first JSON block
    const jsonMatch = preprocessed.match(/(\{[\s\S]*?\})/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch (e) {
        // Continue to next fallback
      }
    }

    // Fallback 2: Handle malformed JSON
    try {
      const repaired = preprocessed
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix keys
        .replace(/'/g, '"') // Replace single quotes
        .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas

      JSON.parse(repaired);
      return repaired;
    } catch (e) {
      throw new Error(`JSON extraction failed: ${(e as Error).message}\nContent: ${raw.slice(0, 100)}...`);
    }
  }
}

/**
 * Parses mixed content responses with optional JSON
 * Returns both text and parsed JSON when available
 */
export function parseMixedResponse(raw: string): TextWithJson {
  try {
    const json = JSON.parse(raw);
    return { text: raw, json };
  } catch {
    const jsonMatch = raw.match(/(\{[\s\S]*?\})/);
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[0]);
        return {
          text: raw.replace(jsonMatch[0], '').trim(),
          json
        };
      } catch (e) {
        return {
          text: raw,
          error: `Partial JSON found but invalid: ${(e as Error).message}`
        };
      }
    }
    return { text: raw };
  }
}

/**
 * Cleans execution steps with enhanced formatting:
 * 1. Removes duplicate numbering
 * 2. Standardizes prefixes
 * 3. Handles markdown lists
 */
export function cleanExecutionSteps(executions: string[]): string[] {
  return executions.map((step, index) => {
    // Remove existing numbering if present
    const cleaned = step
      .replace(/^(\d+[\.\)]\s*)?(Execution\s*\d+[:\.]?\s*)?/i, '')
      .trim();

    // Standardize new numbering (1-based)
    return `${index + 1}. ${capitalizeFirstLetter(cleaned)}`;
  });
}

/**
 * Patch: Replace leading numbers like 1.1, 2.2, 3.4 with 1., 2., etc
 */
export const normalizeExecutionNumbers = (steps: string[]): string[] => {
  return steps.map((step, index) =>
    step.replace(/^\d+(\.\d+)*\s*[:.-]?\s*/, `${index + 1}. `)
  );
};

/**
 * Capitalizes first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates a URL-friendly slug from campaign name
 */
export function generateCampaignSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with dashes
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
}

/**
 * Validates campaign JSON structure with error details
 */
export function validateCampaignStructure(json: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = [
    'campaignName',
    'keyMessage',
    'executionPlan',
    'targetAudience'
  ];

  requiredFields.forEach(field => {
    if (!json[field]) {
      errors.push(`Missing required field: ${field}`);
    } else if (Array.isArray(json[field]) && json[field].length === 0) {
      errors.push(`Empty array in required field: ${field}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extracts hashtags from campaign text
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w-]+/g) || [];
  return [...new Set(matches)]; // Deduplicate
}