import 'server-only'
import axios from 'axios'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'
import { tmdbConfig } from '@/config/tmdb'

export type MediaType = 'movie' | 'tv'

export interface MediaResult {
  id: number
  title?: string
  name?: string
  overview?: string
  media_type?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

export interface MediaPage {
  results: MediaResult[]
  page?: number
  total_pages?: number
  total_results?: number
}

export interface TitleDetails {
  id: number
  title?: string
  name?: string
  overview?: string
  poster_path?: string | null
  genres?: Array<{ id: number; name: string }> | null
  release_date?: string
  first_air_date?: string
  budget?: number
  number_of_seasons?: number
  vote_average?: number
  imdb_id?: string
}

export interface CastMember {
  id: number
  known_for_department: string
  profile_path: string | null
  name?: string
  original_name?: string
  character?: string
}

export interface VideoResults { results: Array<{ key: string; site?: string; type?: string }> }
interface Provider { provider_id?: number; provider_name: string }
export interface ProviderResults { results: Record<string, { flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; free?: Provider[]; ads?: Provider[] }> }

export class TmdbError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'TmdbError'
  }
}

export function tmdbErrorStatus(error: unknown): number {
  return error instanceof TmdbError ? error.status : 500
}

export function isValidTmdbIdentity(mediaType: unknown, mediaId: unknown): mediaType is MediaType {
  if ((mediaType !== 'movie' && mediaType !== 'tv') || typeof mediaId !== 'string' || !/^[1-9]\d*$/.test(mediaId)) return false
  return Number.isSafeInteger(Number(mediaId))
}

function validIdentity(mediaType: unknown, mediaId: unknown): asserts mediaType is MediaType {
  if (!isValidTmdbIdentity(mediaType, mediaId)) throw new TmdbError('Invalid media identity', 400)
}

function validPage(page: unknown): number {
  if (page === undefined || page === '') return 1
  if ((typeof page !== 'string' && typeof page !== 'number') || !/^[1-9]\d*$/.test(String(page))) throw new TmdbError('Invalid page', 400)
  const value = Number(page)
  if (!Number.isSafeInteger(value) || value > tmdbConfig.maxPage) throw new TmdbError('Invalid page', 400)
  return value
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function resultList<T>(value: unknown, field: string): T {
  if (!object(value) || !Array.isArray(value[field]) || value[field].some(item => !object(item))) {
    throw new TmdbError('Invalid TMDB response', 502)
  }
  return value as T
}

function validId(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function mediaPage(value: unknown): MediaPage {
  const page = resultList<MediaPage>(value, 'results')
  if (page.results.some(item => !validId(item.id))) throw new TmdbError('Invalid TMDB response', 502)
  return page
}

// Axios calls are never cached here. Discovery uses route-level ISR; search,
// detail, and API routes remain request-time reads.
async function request(path: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!process.env.API_KEY) throw new TmdbError('TMDB is not configured', 503)
  try {
    const { data } = await axios.get<unknown>(endpoint.tmdb.url(path), {
      timeout: tmdbConfig.timeoutMs,
      params: { ...params, api_key: process.env.API_KEY }
    })
    return data
  } catch (error) {
    // Never retain or log the upstream error; Axios can include credentials.
    if (object(error) && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) throw new TmdbError('TMDB timed out', 504)
    const response = object(error) && object(error.response) ? error.response : null
    const status = response?.status
    throw new TmdbError('Unable to load TMDB data', typeof status === 'number' && Number.isInteger(status) && status >= 400 && status <= 599 ? status : 502)
  }
}

export const tmdb = {
  async discover(mediaType: unknown, page?: unknown): Promise<MediaPage> {
    if (mediaType !== 'movie' && mediaType !== 'tv') throw new TmdbError('Invalid media type', 400)
    const data = await request(endpoint.tmdb.discover(mediaType), {
      sort_by: contentConfig.discoverySort, language: contentConfig.language, page: validPage(page)
    })
    return mediaPage(data)
  },
  async search(query: unknown, page?: unknown): Promise<MediaPage> {
    if (typeof query !== 'string' || !query.trim() || query.length > tmdbConfig.maxSearchLength) throw new TmdbError('Invalid search query', 400)
    const data = await request(endpoint.tmdb.search, { query: query.trim(), language: contentConfig.language, page: validPage(page) })
    return mediaPage(data)
  },
  async title(mediaType: unknown, mediaId: unknown): Promise<TitleDetails> {
    validIdentity(mediaType, mediaId)
    const data = await request(endpoint.tmdb.detail(mediaType, mediaId as string), { language: contentConfig.language })
    if (!object(data) || !validId(data.id) || data.id !== Number(mediaId)) throw new TmdbError('Invalid TMDB response', 502)
    if (data.genres != null && (!Array.isArray(data.genres) || data.genres.some(genre => !object(genre) || !validId(genre.id) || typeof genre.name !== 'string'))) {
      throw new TmdbError('Invalid TMDB response', 502)
    }
    return data as unknown as TitleDetails
  },
  async credits(mediaType: unknown, mediaId: unknown): Promise<CastMember[]> {
    validIdentity(mediaType, mediaId)
    const data = await request(endpoint.tmdb.credits(mediaType, mediaId as string), { language: contentConfig.language })
    const cast = resultList<{ cast: CastMember[] }>(data, 'cast').cast
    if (cast.some(actor => !validId(actor.id) || typeof actor.known_for_department !== 'string' || (actor.profile_path != null && typeof actor.profile_path !== 'string'))) {
      throw new TmdbError('Invalid TMDB response', 502)
    }
    return cast
  },
  async videos(mediaType: unknown, mediaId: unknown): Promise<VideoResults> {
    validIdentity(mediaType, mediaId)
    const videos = resultList<VideoResults>(await request(endpoint.tmdb.videos(mediaType, mediaId as string), { language: contentConfig.language }), 'results')
    if (videos.results.some(video => typeof video.key !== 'string')) throw new TmdbError('Invalid TMDB response', 502)
    return videos
  },
  async watchProviders(mediaType: unknown, mediaId: unknown): Promise<ProviderResults> {
    validIdentity(mediaType, mediaId)
    const data = await request(endpoint.tmdb.watchProviders(mediaType, mediaId as string))
    if (!object(data) || !object(data.results)) throw new TmdbError('Invalid TMDB response', 502)
    for (const region of Object.values(data.results)) {
      if (!object(region) || ['flatrate', 'rent', 'buy', 'free', 'ads'].some(key => region[key] != null && (!Array.isArray(region[key]) || (region[key] as unknown[]).some(provider => !object(provider) || typeof provider.provider_name !== 'string')))) {
        throw new TmdbError('Invalid TMDB response', 502)
      }
    }
    return data as unknown as ProviderResults
  }
} as const
