// Shared URLs and paths only: credentials stay in server-side request code.
import { configuredBaseUrl } from './base-url.cjs'

type Segment = string | number | string[] | undefined
type Resource = 'movies' | 'series'

export const endpoint = {
  api: {
    popular: (resource: Resource, page: number, filters: { genre?: number | null; decade?: number | null } = {}) => {
      const params = new URLSearchParams({ page: String(page) })
      if (filters.genre) params.set('genre', String(filters.genre))
      if (filters.decade) params.set('decade', String(filters.decade))
      return `/api/${resource}/popular?${params}`
    },
    search: (query: string, page: number) => `/api/search?${new URLSearchParams({ query, page: String(page) })}`,
    detail: (mediaType: Segment, mediaId: Segment) => `/api/info/${mediaType}/${mediaId}`,
    cast: (mediaType: Segment, mediaId: Segment) => `/api/cast/${mediaType}/${mediaId}`,
    trailer: (mediaType: Segment, mediaId: Segment) => `/api/info/trailer/${mediaType}/${mediaId}`,
    watchProviders: (mediaType: Segment, mediaId: Segment) => `/api/info/watchproviders/${mediaType}/${mediaId}`
  },
  tmdb: {
    // Server-only: never use this base URL or API credentials in client code.
    url: (path: string) => `${configuredBaseUrl(process.env.TMDB_API_BASE_URL, 'TMDB_API_BASE_URL')}/${path}`,
    discover: (mediaType: Segment) => `3/discover/${mediaType}`,
    search: '3/search/multi',
    detail: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}`,
    credits: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/credits`,
    videos: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/videos`,
    watchProviders: (mediaType: Segment, mediaId: Segment) => `3/${mediaType}/${mediaId}/watch/providers`,
    // Width is a TMDB size token: a pixel width like 500 (w500) or 'original'
    // (for hero-scale backdrops that must survive 2x+ upscales on large screens).
    // Profile sizes are TMDB's fixed-height crops and use the h-prefix (h632).
    image: (size: number | 'original' | `h${number}`, path: string) => `${configuredBaseUrl(process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL, 'NEXT_PUBLIC_TMDB_IMAGE_BASE_URL')}/${size === 'original' ? 'original' : typeof size === 'number' ? `w${size}` : size}${path}`
  },
  imdb: {
    get host() {
      return new URL(configuredBaseUrl(process.env.IMDB_API_BASE_URL, 'IMDB_API_BASE_URL')).hostname
    },
    get overview() {
      return `${configuredBaseUrl(process.env.IMDB_API_BASE_URL, 'IMDB_API_BASE_URL')}/title/get-overview-details`
    }
  },
  youtube: {
    embed: (videoKey: string) => `${configuredBaseUrl(process.env.NEXT_PUBLIC_YOUTUBE_EMBED_BASE_URL, 'NEXT_PUBLIC_YOUTUBE_EMBED_BASE_URL')}/${videoKey}`
  }
} as const
