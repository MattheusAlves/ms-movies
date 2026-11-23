import axios from 'axios'
import { endpoint } from '@/config/endpoint'
import { isValidTmdbIdentity, tmdb } from '@/util/tmdb'
import type { MediaType } from '@/util/tmdb'

export type { MediaType, TitleDetails } from '@/util/tmdb'

export function isValidTitleParams(mediaType: string, mediaId: string): mediaType is MediaType {
  return isValidTmdbIdentity(mediaType, mediaId)
}

// Imported only by the server-rendered detail page.
export async function loadTitle(mediaType: MediaType, mediaId: string) {
  let data
  try {
    data = await tmdb.title(mediaType, mediaId)
  } catch {
    // Axios errors can include the API key in the request URL.
    throw new Error('Unable to load title data from TMDB')
  }

  let imdbRating: number | null = null
  if (data.imdb_id && process.env.RAPIDAPI_KEY) {
    try {
      const imdbResult = await axios.get(
        endpoint.imdb.overview,
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': endpoint.imdb.host
          },
          params: { tconst: data.imdb_id },
          timeout: 3000
        }
      )
      const rating = imdbResult.data?.ratings?.rating
      if (typeof rating === 'number' && Number.isFinite(rating)) imdbRating = rating
    } catch {
      // IMDb ratings are optional; keep the detail page available on failure.
    }
  }
  return { data, mediaType, imdbRating }
}
