export const apiConfig = {
  models: {
    haiku: 'claude-3-haiku-20240307',
    sonnet: 'claude-3-5-sonnet-20241022',
  },
  tokenLimits: {
    default: 4096,
    growthPlan: 8192,
  },
  retry: {
    maxRetries: 5,
    baseDelay: 1000,
  },
  prompts: {
    path: 'prompts',
  },
  beta: {
    headers: {
      'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
    },
  },
} as const;