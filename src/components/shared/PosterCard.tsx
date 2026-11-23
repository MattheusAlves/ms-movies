'use client'

import { useContext, useId, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { useOpenDetail } from '@/components/DetailModal'
import WatchlistButton from '@/components/shared/WatchlistButton'
import type { MediaSummary } from '@/util/media'

export default function PosterCard({ src, info, featured = false }: { src: string; info: MediaSummary; featured?: boolean }): React.JSX.Element {
  const { contentType } = useContext(ContentTypeContext)
  const [imageError, setImageError] = useState(false)
  const summaryId = useId()
  const mediaType = info.mediaType || (contentType === 'movies' ? 'movie' : contentType === 'series' ? 'tv' : '')
  const valid = (mediaType === 'movie' || mediaType === 'tv') && Number.isSafeInteger(info.mediaId) && info.mediaId > 0
  const href = `/info/${mediaType}/${info.mediaId}`
  const title = info.title || 'Untitled'
  const openDetail = useOpenDetail()
  const openInModal = openDetail && valid
    ? (event: React.MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        openDetail({ mediaType: mediaType as 'movie' | 'tv', mediaId: info.mediaId })
      }
    : undefined
  const image = (
    <Image
      src={imageError ? '/404.png' : src}
      width={256}
      height={360}
      sizes="(max-width: 480px) 46vw, (max-width: 650px) 30vw, (max-width: 900px) 23vw, (max-width: 1200px) 18vw, 230px"
      alt={title}
      loading={featured ? 'eager' : 'lazy'}
      fetchPriority={featured ? 'high' : 'auto'}
      onError={() => setImageError(true)}
    />
  )
  return (
    <article className="poster-wrapper">
      <div className="poster-art">
        {valid ? (
          <Link className="poster-image" href={href} aria-label={`View ${title}`} aria-describedby={summaryId} onClick={openInModal}>
            {image}
            <span className="poster-overlay" aria-hidden="true"><span>Synopsis</span><span>{info.overview || 'No synopsis is available yet.'}</span></span>
          </Link>
        ) : <div className="poster-image">{image}</div>}
        <WatchlistButton item={info} />
      </div>
      {valid && <p id={summaryId} className="sr-only">{info.overview || 'No synopsis is available yet.'}</p>}
      <div className="poster-caption">
        {valid ? <Link className="poster-title" href={href} onClick={openInModal}>{title}</Link> : <span className="poster-title">{title}</span>}
        <p className="poster-meta">
          <span>{info.releaseDate ? info.releaseDate.slice(0, 4) : 'Year unavailable'}</span>
          {info.voteAverage > 0 && <span aria-label={`TMDB rating ${info.voteAverage.toFixed(1)} out of 10`}>★ {info.voteAverage.toFixed(1)}</span>}
        </p>
      </div>
    </article>
  )
}
