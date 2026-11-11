import { useContext, useState } from 'react'
import Image from 'next/image'
import { useNavigation } from '@/contexts/NavigationContext'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'
import { MediaSummary } from '@/util/media'
interface Props {
  src: string
  info: MediaSummary
}

const PosterCard = (props: Props): React.JSX.Element => {
  const { src, info } = props
  const router = useNavigation()
  const { contentType } = useContext(ContentTypeContext)
  const { toggleWatchItem, isWatchItemSaved, canEdit } = useContext(ToWatchListContext)
  const mediaType = info.mediaType || (contentType === 'movies' ? 'movie' : contentType === 'series' ? 'tv' : '')
  const saved = isWatchItemSaved(info)
  const [imageError, setImageError] = useState(false)
  const handlePosterClick = () => {
    if (mediaType) router.push(`/info/${mediaType}/${info.mediaId}`)
  }
  const handleToggleWatchItem = e => {
    e.stopPropagation()
    toggleWatchItem(info)
  }
  return (
    <div className="poster-wrapper" onClick={handlePosterClick}>
      <Image
        src={imageError ? '/404.png' : src}
        width={256}
        height={360}
        alt={info.title || ''}
        onError={() => setImageError(true)}
      />
      <div className="poster-info-container">
        <span className="poster-info-vote_avarage-wrapper">
          <p className="poster-info-vote_avarage">{info.voteAverage || ''}</p>
        </span>
        <button
          type="button"
          className="poster-info-add_to_watch_list"
          onClick={handleToggleWatchItem}
          disabled={!canEdit || !mediaType || !Number.isSafeInteger(info.mediaId) || info.mediaId <= 0}
          aria-label={`${saved ? 'Remove' : 'Add'} ${info.title} ${saved ? 'from' : 'to'} watchlist`}
          aria-pressed={saved}
        >
          {saved ? (
            <p className="poster-info-add_to_watch_list-heart">❤</p>
          ) : (
            <p>+</p>
          )}
        </button>
        <p className="poster-info-title">{info.title || ''}</p>
        <p className="poster-info-overview">{`${
          info.overview ? info.overview.slice(0, 95) : ''
        }...`}</p>
      </div>
    </div>
  )
}

export default PosterCard
