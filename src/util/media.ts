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
