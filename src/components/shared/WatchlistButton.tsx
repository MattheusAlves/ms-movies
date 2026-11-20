'use client'

import { useContext } from 'react'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'
import type { MediaSummary } from '@/util/media'

export default function WatchlistButton({ item, variant = 'card' }: { item: MediaSummary; variant?: 'card' | 'detail' }) {
  const { contentType } = useContext(ContentTypeContext)
  const { toggleWatchItem, isWatchItemSaved, canEdit } = useContext(ToWatchListContext)
  const mediaType = item.mediaType || (contentType === 'movies' ? 'movie' : contentType === 'series' ? 'tv' : '')
  const saved = isWatchItemSaved(item)
  const validId = Number.isSafeInteger(item.mediaId) && item.mediaId > 0
  const supported = mediaType === 'movie' || mediaType === 'tv'
  const title = item.title || 'this title'
  const label = variant === 'detail'
    ? `${saved ? 'Saved to watchlist — remove' : 'Save to watchlist —'} ${title}`
    : `${saved ? 'Remove' : 'Add'} ${title} ${saved ? 'from' : 'to'} watchlist`
  return (
    <button
      type="button"
      className={variant === 'detail' ? 'button button--outline' : 'save-button'}
      disabled={!canEdit || !validId || (!supported && !saved)}
      aria-label={label}
      aria-pressed={saved}
      onClick={event => { event.stopPropagation(); toggleWatchItem(item) }}
    >
      <span aria-hidden="true">{saved ? '✓' : '+'}</span>
      {variant === 'detail' && <span>{saved ? 'Saved to watchlist' : 'Save to watchlist'}</span>}
    </button>
  )
}
