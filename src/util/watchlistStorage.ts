import { watchlistConfig } from '@/config/watchlist'
import { MediaSummary, normalizeMediaItem } from '@/util/media'

export interface WatchlistLoadResult {
  items: MediaSummary[]
  readOnly: boolean
  warning: string | null
  snapshot: string | null
}

const invalidData = 'Your saved watchlist could not be read safely. Your existing data has not been changed; do not clear browser data.'
const unavailable = 'Watchlist storage is unavailable. Changes may be lost when you reload; existing cookies have not been changed.'
const conflict = 'Your watchlist changed in another tab. Editing is paused to prevent overwriting data; unsaved changes remain in this tab.'

export class WatchlistConflictError extends Error {}

function normalizeItems(value: unknown): MediaSummary[] | null {
  if (!Array.isArray(value)) return null
  const items: MediaSummary[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const item = raw as Record<string, unknown>
    const id = item.mediaId ?? item.id
    const mediaType = item.mediaType || item.media_type
    if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0 || typeof mediaType !== 'string' || !mediaType.trim()) return null
    for (const key of ['title', 'name', 'overview', 'releaseDate', 'release_date', 'first_air_date', 'posterPath', 'poster_path', 'backdropPath', 'backdrop_path']) {
      if (item[key] != null && typeof item[key] !== 'string') return null
    }
    for (const key of ['voteAverage', 'vote_average']) {
      if (item[key] != null && (typeof item[key] !== 'number' || !Number.isFinite(item[key]))) return null
    }
    items.push(normalizeMediaItem(item as Parameters<typeof normalizeMediaItem>[0]))
  }
  return items
}

function parseLegacy(list: string | undefined, ids: string | undefined): MediaSummary[] | null {
  try {
    const items = list ? normalizeItems(JSON.parse(list)) : []
    if (!items) return null
    if (ids) {
      const parsedIds: unknown = JSON.parse(ids)
      if (!Array.isArray(parsedIds) || parsedIds.some(id => typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0)) return null
      if (parsedIds.some(id => !items.some(item => item.mediaId === id))) return null
    }
    return items
  } catch {
    return null
  }
}

export function parseStoredWatchlist(raw: string): MediaSummary[] | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const record = value as { version?: unknown; items?: unknown }
    if (record.version !== watchlistConfig.version) return null
    return normalizeItems(record.items)
  } catch {
    return null
  }
}

export function saveWatchlist(storage: Storage, items: MediaSummary[], expected?: string | null): string {
  if (expected !== undefined && storage.getItem(watchlistConfig.storageKey) !== expected) throw new WatchlistConflictError()
  const value = JSON.stringify({ version: watchlistConfig.version, items })
  storage.setItem(watchlistConfig.storageKey, value)
  if (storage.getItem(watchlistConfig.storageKey) !== value) throw new Error('Watchlist storage verification failed')
  return value
}

// Cookies are deliberately never removed or rewritten by the migration.
export function loadWatchlist(storage: Storage | null, legacyList?: string, legacyIds?: string): WatchlistLoadResult {
  if (storage) {
    try {
      const raw = storage.getItem(watchlistConfig.storageKey)
      if (raw !== null) {
        const items = parseStoredWatchlist(raw)
        return items ? { items, readOnly: false, warning: null, snapshot: raw } : { items: [], readOnly: true, warning: invalidData, snapshot: raw }
      }
    } catch {
      storage = null
    }
  }

  const items = parseLegacy(legacyList, legacyIds)
  if (!items) return { items: [], readOnly: true, warning: invalidData, snapshot: null }
  if (!storage) return { items, readOnly: false, warning: unavailable, snapshot: null }
  if (legacyList || legacyIds) {
    try {
      const snapshot = saveWatchlist(storage, items, null)
      return { items, readOnly: false, warning: null, snapshot }
    } catch (error) {
      if (error instanceof WatchlistConflictError) return { items, readOnly: true, warning: conflict, snapshot: null }
      return { items, readOnly: false, warning: unavailable, snapshot: null }
    }
  }
  return { items, readOnly: false, warning: null, snapshot: null }
}

export function storageUnavailableWarning(): string {
  return unavailable
}

export function storageConflictWarning(): string {
  return conflict
}
