export const AI_MODELS = {
  DEFAULT_OPS: 'gemma-4-31b-it',
  COMPLEX_LOGIC: 'gemma-4-31b-it',
  VECTORIZATION: 'text-embedding-004',
  BATCH_OPS: 'gemma-4-31b-it',
} as const;

export type AIModelType = keyof typeof AI_MODELS;
