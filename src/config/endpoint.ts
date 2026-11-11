// Shared URLs and paths only: credentials stay in server-side request code.
type Segment = string | number | string[] | undefined
type Resource = 'movies' | 'series'

const tmdbBase = 'https://api.themoviedb.org'
const imdbHost = 'imdb8.p.rapidapi.com'

export const endpoint = {
  api: {
    popular: (resource: Resource, page: number) => `/api/${resource}/popular?page=${page}`,
    cast: (mediaType: Segment, mediaId: Segment) => `/api/cast/${mediaType}/${mediaId}`,
    trailer: (mediaType: Segment, mediaId: Segment) => `/api/info/trailer/${mediaType}/${mediaId}`,
    watchProviders: (mediaType: Segment, mediaId: Segment) => `/api/info/watchproviders/${mediaType}/${mediaId}`,
    // These routes are currently placeholders, not functional API endpoints.
    category: (resource: Resource) => `/api/${resource}/by/category`
  },
  tmdb: {
    url: (path: string) => `${tmdbBase}/${path}`,
    discover: (mediaType: Segment) => `3/discover/${mediaType}`,
    search: '3/search/multi',
    detail: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}`,
    credits: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/credits`,
    videos: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/videos`,
    watchProviders: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/watch/providers`,
    image: (width: number, path: string) => `https://image.tmdb.org/t/p/w${width}${path}`
  },
  imdb: {
    host: imdbHost,
    overview: `https://${imdbHost}/title/get-overview-details`
  },
  youtube: {
    embed: (videoKey: string) => `https://www.youtube.com/embed/${videoKey}`
  }
} as const
