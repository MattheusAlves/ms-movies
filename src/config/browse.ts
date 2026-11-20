// Shared, non-secret settings for the header's Browse menu. Genre IDs are TMDB's.
export const browseGenres = [
  { label: 'Drama', id: 18 },
  { label: 'Thriller', id: 53 },
  { label: 'Science fiction', id: 878 },
  { label: 'Comedy', id: 35 },
  { label: 'Action', id: 28 },
  { label: 'Animation', id: 16 }
] as const

export const browseDecades = [2020, 2010, 2000, 1990] as const

export function browseHref(resource: 'movies' | 'series', filters: { genre?: number; decade?: number } = {}): string {
  const params = new URLSearchParams()
  if (filters.genre) params.set('genre', String(filters.genre))
  if (filters.decade) params.set('decade', String(filters.decade))
  const query = params.toString()
  return `/${resource}${query ? `?${query}` : ''}`
}
