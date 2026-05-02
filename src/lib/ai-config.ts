export const AI_MODELS = {
  DEFAULT_OPS: 'gemini-3.1-flash-lite-preview', 
  COMPLEX_LOGIC: 'gemini-3-flash-preview',      
  VECTORIZATION: 'text-embedding-004',
  BATCH_OPS: 'gemini-3.1-flash-lite-preview',
} as const;

export type AIModelType = keyof typeof AI_MODELS;
