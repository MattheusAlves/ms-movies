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

export function normalizeMediaItem(
  raw: Record<string, any>
): MediaSummary {
  return {
    title: raw.title || raw.name || '',
    overview: raw.overview || '',
    releaseDate:
      raw.releaseDate || raw.release_date || raw.first_air_date || '',
    voteAverage: raw.voteAverage ?? raw.vote_average ?? 0,
    mediaType: raw.mediaType || raw.media_type || '',
    mediaId: raw.mediaId ?? raw.id,
    // `poster_path` also covers watchlist items saved by older versions.
    posterPath: raw.posterPath || raw.poster_path || '',
    backdropPath: raw.backdropPath || raw.backdrop_path || ''
  }
}
