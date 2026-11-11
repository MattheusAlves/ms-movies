import axios from 'axios'

/**
 * Server-side TMDB read helper shared by the API proxy routes.
 * Keeps the API key server-only and gives every route the same error contract:
 * callers return `{ message: 'Api error' }` without exposing upstream bodies.
 */
export async function tmdbGet<T = unknown>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const { data } = await axios.get<T>(`https://api.themoviedb.org/${path}`, {
    // Explicit last so callers cannot override the server key.
    params: { ...params, api_key: process.env.API_KEY }
  })
  return data
}
