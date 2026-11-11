import axios from 'axios'

export type MediaType = 'movie' | 'tv'

export interface TitleDetails {
  id: number
  title?: string
  name?: string
  overview?: string
  poster_path?: string | null
  genres?: Array<{ id: number; name: string }>
  release_date?: string
  first_air_date?: string
  budget?: number
  number_of_seasons?: number
  vote_average?: number
  imdb_id?: string
}

export function isValidTitleParams(mediaType: string, mediaId: string): mediaType is MediaType {
  return (mediaType === 'movie' || mediaType === 'tv') && /^[1-9]\d*$/.test(mediaId)
}

// Imported only by the server-rendered detail page.
export async function loadTitle(mediaType: MediaType, mediaId: string) {
  let result
  try {
    result = await axios.get<TitleDetails>(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}?language=en-US`,
      { params: { api_key: process.env.API_KEY } }
    )
  } catch {
    // Axios errors can include the API key in the request URL.
    throw new Error('Unable to load title data from TMDB')
  }

  let imdbRating: number | null = null
  if (result.data.imdb_id && process.env.RAPIDAPI_KEY) {
    try {
      const imdbResult = await axios.get(
        'https://imdb8.p.rapidapi.com/title/get-overview-details',
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'imdb8.p.rapidapi.com'
          },
          params: { tconst: result.data.imdb_id },
          timeout: 3000
        }
      )
      const rating = imdbResult.data?.ratings?.rating
      if (typeof rating === 'number' && Number.isFinite(rating)) imdbRating = rating
    } catch {
      // IMDb ratings are optional; keep the detail page available on failure.
    }
  }
  return { data: result.data, mediaType, imdbRating }
}
