import { beforeEach, describe, expect, it, vi } from 'vitest'
import { watchlistConfig } from '@/config/watchlist'
import { loadWatchlist, parseStoredWatchlist, saveWatchlist, WatchlistConflictError } from '@/util/watchlistStorage'

const key = watchlistConfig.storageKey
const movie = { mediaId: 7, mediaType: 'movie', title: 'Movie', poster_path: '/old.jpg' }
const series = { mediaId: 7, mediaType: 'tv', name: 'Series', first_air_date: '2020-01-01' }

beforeEach(() => localStorage.clear())

describe('watchlist storage migration', () => {
  it('imports legacy entries and preserves distinct media types with the same ID', () => {
    const list = JSON.stringify([movie, series])
    const result = loadWatchlist(localStorage, list, JSON.stringify([7]))
    expect(result.warning).toBeNull()
    expect(result.readOnly).toBe(false)
    expect(result.items).toMatchObject([
      { mediaId: 7, mediaType: 'movie', title: 'Movie', posterPath: '/old.jpg' },
      { mediaId: 7, mediaType: 'tv', title: 'Series', releaseDate: '2020-01-01' }
    ])
    const saved = JSON.parse(localStorage.getItem(key)!)
    expect(saved.version).toBe(1)
    expect(saved.items).toEqual(result.items)
  })

  it('prefers valid versioned data and never reimports an older cookie', () => {
    const original = loadWatchlist(localStorage, JSON.stringify([movie]))
    const result = loadWatchlist(localStorage, JSON.stringify([series]))
    expect(result.items).toEqual(original.items)
  })

  it.each([
    ['broken JSON', '{', undefined],
    ['missing media type', JSON.stringify([{ mediaId: 7, title: 'Unknown' }]), undefined],
    ['invalid ID', JSON.stringify([{ mediaId: '7', mediaType: 'movie' }]), undefined],
    ['orphan ID', JSON.stringify([movie]), JSON.stringify([7, 9])],
    ['malformed ID cookie', JSON.stringify([movie]), 'not-json']
  ])('does not overwrite or silently discard %s', (_label, list, ids) => {
    const result = loadWatchlist(localStorage, list, ids)
    expect(result.readOnly).toBe(true)
    expect(result.warning).toMatch(/not been changed/)
    expect(localStorage.getItem(key)).toBeNull()
  })

  it.each(['not-json', JSON.stringify({ version: 2, items: [] }), JSON.stringify({ version: 1, items: [null] })])(
    'keeps unreadable or newer versioned data intact', raw => {
      localStorage.setItem(key, raw)
      const result = loadWatchlist(localStorage, JSON.stringify([movie]))
      expect(result.readOnly).toBe(true)
      expect(result.warning).toMatch(/not been changed/)
      expect(localStorage.getItem(key)).toBe(raw)
    }
  )

  it('keeps recoverable legacy items in memory and warns if storage fails', () => {
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(() => { throw new Error('quota') }) } as unknown as Storage
    const result = loadWatchlist(storage, JSON.stringify([movie]))
    expect(result.items[0]).toMatchObject({ mediaId: 7, mediaType: 'movie' })
    expect(result.readOnly).toBe(false)
    expect(result.warning).toMatch(/may be lost/)
  })

  it('reports unavailable storage without losing a valid cookie', () => {
    const result = loadWatchlist(null, JSON.stringify([movie]))
    expect(result.items).toHaveLength(1)
    expect(result.warning).toMatch(/existing cookies have not been changed/)
  })

  it('verifies versioned saves and rejects invalid stored values', () => {
    const items = loadWatchlist(localStorage, JSON.stringify([movie])).items
    saveWatchlist(localStorage, items)
    expect(parseStoredWatchlist(localStorage.getItem(key)!)).toEqual(items)
    expect(parseStoredWatchlist('{')).toBeNull()
  })

  it('does not overwrite a newer storage snapshot', () => {
    const items = loadWatchlist(localStorage, JSON.stringify([movie])).items
    const oldSnapshot = localStorage.getItem(key)!
    const newer = JSON.stringify({ version: 1, items: [series] })
    localStorage.setItem(key, newer)
    expect(() => saveWatchlist(localStorage, items, oldSnapshot)).toThrow(WatchlistConflictError)
    expect(localStorage.getItem(key)).toBe(newer)
  })
})
