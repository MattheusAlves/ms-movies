import { tmdb } from '@/util/tmdb'

export type DiscoveryResource = 'movies' | 'series'

// Imported only by server-rendered discovery pages.
export async function loadDiscoveryData(resource: DiscoveryResource) {
  const mediaType = resource === 'movies' ? 'movie' : 'tv'
  try {
    return [await tmdb.discover(mediaType, 1)]
  } catch {
    // Axios errors can contain the request URL and API key.
    throw new Error('Unable to load discovery data from TMDB')
  }
}
