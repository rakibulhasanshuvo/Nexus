import { AI_MODELS, AIModelType } from './ai-config';

/**
 * Retrieves the appropriate API key to use.
 * Priorities:
 * 1. userApiKey (from localStorage / client, passed down to server action)
 * 2. getAvailableGeminiKey() from env.ts (load balanced server default)
 */
export async function getApiKey(userApiKey?: string | null): Promise<string> {
  if (userApiKey && userApiKey.trim() !== '') {
    return userApiKey.trim();
  }

  const { getAvailableGeminiKey } = await import('./env');
  const serverKey = await getAvailableGeminiKey();

  return serverKey;
}

/**
 * Resolves the model string identifier based on the requested operation type.
 */
export function getModelIdentifier(operationType: AIModelType): string {
  return AI_MODELS[operationType];
}

/**
 * Configuration object for AI API calls.
 */
export interface AIRequestConfig {
  operationType: AIModelType;
  userApiKey?: string | null;
}

/**
 * Generates the finalized routing configuration for an AI request.
 */
export async function resolveApiRoute(config: AIRequestConfig) {
  return {
    model: getModelIdentifier(config.operationType),
    apiKey: await getApiKey(config.userApiKey),
  };
}
