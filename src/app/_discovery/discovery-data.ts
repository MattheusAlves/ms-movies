import axios from 'axios'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

export type DiscoveryResource = 'movies' | 'series'

// Imported only by server-rendered discovery pages.
export async function loadDiscoveryData(resource: DiscoveryResource) {
  const mediaType = resource === 'movies' ? 'movie' : 'tv'
  try {
    const result = await axios.get(
      endpoint.tmdb.url(endpoint.tmdb.discover(mediaType)),
      { params: { api_key: process.env.API_KEY, sort_by: contentConfig.discoverySort, language: contentConfig.language, page: 1 } }
    )
    return [result.data]
  } catch {
    // Axios errors can contain the request URL and API key.
    throw new Error('Unable to load discovery data from TMDB')
  }
}
