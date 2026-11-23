// Shared, non-secret request limits. Caching is configured on each route.
export const tmdbConfig = {
  timeoutMs: 8000,
  maxPage: 500,
  maxSearchLength: 500
} as const
