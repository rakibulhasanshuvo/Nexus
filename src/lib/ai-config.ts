export const AI_MODELS = {
  DEFAULT_OPS: 'gemini-3.1-flash-lite',
  COMPLEX_LOGIC: 'gemini-3-flash',
  VECTORIZATION: 'gemini-embedding-2',
  BATCH_OPS: 'gemma-4-31b',
} as const;

export type AIModelType = keyof typeof AI_MODELS;
