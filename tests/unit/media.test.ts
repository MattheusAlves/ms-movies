// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { formatReleaseDate, normalizeMediaItem } from '@/util/media'

describe('normalizeMediaItem', () => {
  it('normalizes a TMDB discovery/search item', () => {
    expect(
      normalizeMediaItem({
        id: 12,
        title: 'A movie',
        overview: 'Movie overview',
        release_date: '2026-01-01',
        vote_average: 8,
        media_type: 'movie',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg'
      })
    ).toEqual({
      title: 'A movie',
      overview: 'Movie overview',
      releaseDate: '2026-01-01',
      voteAverage: 8,
      mediaType: 'movie',
      mediaId: 12,
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg'
    })
  })

  it('normalizes a series item using the name and air-date fields', () => {
    const media = normalizeMediaItem({ id: 13, name: 'A series', first_air_date: '2021-01-01' })
    expect(media.title).toBe('A series')
    expect(media.releaseDate).toBe('2021-01-01')
    expect(media.mediaType).toBe('')
  })

  it('prefers the persisted watchlist field names', () => {
    const media = normalizeMediaItem({
      mediaId: 14,
      title: 'Saved',
      releaseDate: '2025-01-01',
      voteAverage: 7,
      mediaType: 'tv'
    })
    expect(media.mediaId).toBe(14)
    expect(media.releaseDate).toBe('2025-01-01')
    expect(media.voteAverage).toBe(7)
  })

  it('accepts the legacy snake_case watchlist item shape from old cookies', () => {
    const media = normalizeMediaItem({
      mediaId: 14,
      title: 'Saved',
      poster_path: '/legacy.jpg'
    })
    expect(media.posterPath).toBe('/legacy.jpg')
  })

  it('defaults missing fields instead of leaking undefined', () => {
    expect(normalizeMediaItem({})).toEqual({
      title: '',
      overview: '',
      releaseDate: '',
      voteAverage: 0,
      mediaType: '',
      mediaId: undefined,
      posterPath: '',
      backdropPath: ''
    })
  })
})

describe('formatReleaseDate', () => {
  it('formats an ISO date in long localized form without day shift', () => {
    expect(formatReleaseDate('2026-03-14', 'en-US')).toBe('March 14, 2026')
  })

  it('formats an ISO date in another locale', () => {
    expect(formatReleaseDate('2026-03-14', 'pt-BR')).toBe('14 de março de 2026')
  })

  it('falls back to the raw string for a bare year', () => {
    expect(formatReleaseDate('2026', 'en-US')).toBe('2026')
  })
})
