import { AI_MODELS, AIModelType } from './ai-config';

/**
 * Retrieves the appropriate API key to use.
 * Priorities:
 * 1. userApiKey (from localStorage / client, passed down to server action)
 * 2. process.env.GEMINI_API_KEY (server default)
 */
export function getApiKey(userApiKey?: string | null): string {
  if (userApiKey && userApiKey.trim() !== '') {
    return userApiKey.trim();
  }

  const serverKey = process.env.GEMINI_API_KEY;
  if (!serverKey) {
    throw new Error('No API key provided. Please provide a user key or ensure GEMINI_API_KEY is set in the environment.');
  }
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
export function resolveApiRoute(config: AIRequestConfig) {
  return {
    model: getModelIdentifier(config.operationType),
    apiKey: getApiKey(config.userApiKey),
  };
}
