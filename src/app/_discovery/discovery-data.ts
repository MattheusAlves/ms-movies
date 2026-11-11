import axios from 'axios'

export type DiscoveryResource = 'movies' | 'series'

// Imported only by server-rendered discovery pages.
export async function loadDiscoveryData(resource: DiscoveryResource) {
  const mediaType = resource === 'movies' ? 'movie' : 'tv'
  try {
    const result = await axios.get(
      `https://api.themoviedb.org/3/discover/${mediaType}?sort_by=popularity.desc`,
      { params: { api_key: process.env.API_KEY, language: 'en-US', page: 1 } }
    )
    return [result.data]
  } catch {
    // Axios errors can contain the request URL and API key.
    throw new Error('Unable to load discovery data from TMDB')
  }
}
