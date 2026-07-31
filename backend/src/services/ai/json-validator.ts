export function extractAndValidateJSON(rawResponse: string): any {
  if (!rawResponse || rawResponse.trim() === '') {
    throw new Error('Empty response');
  }

  let cleaned = rawResponse.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt basic repair:
    try {
      // Find the first { and last }
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(cleaned.substring(start, end + 1));
      }
    } catch (e2) {
      throw new Error('Failed to parse JSON even after repair');
    }
    throw new Error('Invalid JSON format');
  }
}
