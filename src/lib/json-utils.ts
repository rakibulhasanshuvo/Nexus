/**
 * Safely parses a JSON string, validating it against a default value's type.
 *
 * @param item The JSON string to parse (from localStorage or elsewhere)
 * @param defaultValue The value to return if parsing fails or type validation fails
 * @param validator Optional custom validation function
 * @returns The parsed value if valid, otherwise the defaultValue
 */
export function safeJsonParse<T>(
  item: string | null,
  defaultValue: T,
  validator?: (data: unknown) => data is T
): T {
  if (item === null) return defaultValue;

  try {
    const parsed = JSON.parse(item);

    // 1. If a custom validator is provided, use it
    if (validator) {
      return validator(parsed) ? parsed : defaultValue;
    }

    // 2. Fallback to basic type matching

    // Handle null explicitly (JSON.parse('null') returns null)
    if (parsed === null) {
      return defaultValue === null ? (parsed as T) : defaultValue;
    }

    // If defaultValue is null but parsed is not null, it's a mismatch
    if (defaultValue === null && parsed !== null) {
        return defaultValue;
    }

    // Handle Arrays (they are 'object' type in JS)
    if (Array.isArray(defaultValue)) {
      return Array.isArray(parsed) ? (parsed as T) : defaultValue;
    }

    // Handle Objects (excluding null and arrays)
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      return (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed))
        ? (parsed as T)
        : defaultValue;
    }

    // Handle Primitives (number, string, boolean)
    if (typeof parsed === typeof defaultValue) {
      return parsed as T;
    }

    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON from storage:', e);
    return defaultValue;
  }
}
