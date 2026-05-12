/**
 * Helper to get an AI client instance.
 * Separated to facilitate testing and consistent instantiation.
 */
export function createAIClient<T, C extends new (config: { apiKey: string }) => T>(
  AIClientClass: C,
  apiKey: string
): T {
  return new AIClientClass({ apiKey });
}
