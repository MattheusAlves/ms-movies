'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOpenDetail } from '@/components/DetailModal'
import WatchlistButton from '@/components/shared/WatchlistButton'
import { endpoint } from '@/config/endpoint'
import { imageConfig } from '@/config/images'
import { normalizeMediaItem } from '@/util/media'
import type { MediaResult } from '@/util/tmdb'

// The first discovery result becomes the full-bleed cover on the landing views.
// TMDB supplies backdrop_path; older or incomplete items fall back to the poster.
export default function CoverHero({ item, resource }: {
  item: MediaResult
  resource: 'movies' | 'series'
}) {
  const media = normalizeMediaItem({ ...item, media_type: resource === 'movies' ? 'movie' : 'tv' })
  const isMovie = resource === 'movies'
  const imagePath = item.backdrop_path || item.poster_path
  // Both branches render full-bleed at 100vw, so both need the
  // highest-quality source TMDB offers.
  const imageUrl = imagePath
    ? endpoint.tmdb.image(imageConfig.backdropHeroWidth, imagePath)
    : null
  const year = media.releaseDate.slice(0, 4)
  const href = `/info/${media.mediaType}/${media.mediaId}`
  const openDetail = useOpenDetail()
  const openInModal = openDetail
    ? (event: React.MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        openDetail({ mediaType: media.mediaType as 'movie' | 'tv', mediaId: media.mediaId })
      }
    : undefined

  return (
    <section className="cover-hero" aria-labelledby="cover-title">
      {imageUrl && (
        <div className="cover-hero-media" aria-hidden="true">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={item.backdrop_path ? 'cover-hero-image' : 'cover-hero-image cover-hero-image--poster'}
          />
        </div>
      )}
      <div className="cover-hero-inner">
        <div className="cover-hero-copy">
          <p className="eyebrow cover-hero-kicker">
            <span className="cover-hero-tag">This week</span>
            {year && <><span>{year}</span><span aria-hidden="true">·</span></>}
            {media.voteAverage > 0 && <><span>{media.voteAverage.toFixed(1)} TMDB</span><span aria-hidden="true">·</span></>}
            <span>{isMovie ? 'Film' : 'Series'}</span>
          </p>
          <h1 id="cover-title">{media.title || (isMovie ? 'Popular movies' : 'Popular series')}</h1>
          {media.overview && <p className="cover-hero-desc">{media.overview}</p>}
          <div className="cover-hero-actions">
            <Link className="button button--accent" href={href} onClick={openInModal}>{isMovie ? 'Open film' : 'Open series'} <span aria-hidden="true">→</span></Link>
            <WatchlistButton item={media} variant="detail" />
          </div>
        </div>
        {media.voteAverage > 0 && (
          <p className="cover-hero-score"><b>{media.voteAverage.toFixed(1)}</b><span>TMDB score</span></p>
        )}
      </div>
    </section>
  )
}
