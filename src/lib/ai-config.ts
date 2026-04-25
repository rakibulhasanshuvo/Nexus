export const AI_MODELS = {
  DEFAULT_OPS: 'gemini-2.5-flash',
  COMPLEX_LOGIC: 'gemini-2.5-flash',
  VECTORIZATION: 'text-embedding-004',
  BATCH_OPS: 'gemini-2.5-flash',
} as const;

export type AIModelType = keyof typeof AI_MODELS;
