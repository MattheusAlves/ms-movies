// Raw TMDB payloads and saved watchlist items describe the same things with
// different field names (movie vs series, API vs persisted). These helpers
// normalize both into the one shape the UI works with.

export interface MediaSummary {
  title: string
  overview: string
  releaseDate: string
  voteAverage: number
  mediaType: string
  mediaId: number
  posterPath: string
  backdropPath: string
}

export interface RawMediaItem extends Partial<MediaSummary> {
  id?: number
  name?: string
  release_date?: string | null
  first_air_date?: string | null
  vote_average?: number
  media_type?: string
  poster_path?: string | null
  backdrop_path?: string | null
}

// TMDB dates are ISO `YYYY-MM-DD`. Render them in long localized form
// (e.g. "March 14, 2026"); anything else (a bare year, a partial or
// unparseable value) is returned unchanged.
export function formatReleaseDate(date: string, locale: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  // Append local midnight so the date is parsed as local time; a bare
  // `YYYY-MM-DD` string is otherwise treated as UTC and can shift a day.
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function normalizeMediaItem(
  raw: RawMediaItem
): MediaSummary {
  return {
    title: raw.title || raw.name || '',
    overview: raw.overview || '',
    releaseDate:
      raw.releaseDate || raw.release_date || raw.first_air_date || '',
    voteAverage: raw.voteAverage ?? raw.vote_average ?? 0,
    mediaType: raw.mediaType || raw.media_type || '',
    // Missing IDs are retained for compatibility with legacy persisted data;
    // validation of stored entries is planned separately.
    mediaId: (raw.mediaId ?? raw.id) as number,
    // `poster_path` also covers watchlist items saved by older versions.
    posterPath: raw.posterPath || raw.poster_path || '',
    backdropPath: raw.backdropPath || raw.backdrop_path || ''
  }
}
