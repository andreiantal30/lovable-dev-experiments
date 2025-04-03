/**
 * Extracts clean JSON from an OpenAI response string,
 * even if it contains extra text or markdown.
 */
export function extractJsonFromResponse(raw: string): string {
  try {
    // Try parsing the entire string first
    JSON.parse(raw);
    return raw;
  } catch {
    // Fallback: extract first JSON-looking block using regex
    const jsonMatch = raw.match(/({[\s\S]*?})/); // non-greedy match
    if (jsonMatch && jsonMatch[0]) {
      return jsonMatch[0];
    }
    throw new Error("❌ No valid JSON found in OpenAI response");
  }
}

/**
 * Cleans duplicate prefixes in execution steps like "1. Execution 1:"
 * Converts "1. Execution 1:..." → "1. ..."
 */
export function cleanExecutionSteps(executions: string[]): string[] {
  return executions.map((step, index) => {
    // Remove any duplicate "Execution X:" inside each step
    return step.replace(/^(\d+\.\s)?Execution\s\d+:\s*/i, `${index + 1}. `);
  });
}