import { useContext, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { BrowserView } from 'react-device-detect'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'
import { MediaSummary } from '@/util/media'
interface Props {
  src: string
  info: MediaSummary
}

const PosterCard = (props: Props): React.JSX.Element => {
  const { src, info } = props
  const router = useRouter()
  const { toggleWatchItem, itemsId } = useContext(ToWatchListContext)
  const [imageError, setImageError] = useState(false)
  const handlePosterClick = () => {
    router.push(
      `/info/${
        info.mediaType || (router.query.type === 'movies' ? 'movie' : 'tv')
      }/${info.mediaId}`
    )
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
      <BrowserView className="poster-info-container">
        <span className="poster-info-vote_avarage-wrapper">
          <p className="poster-info-vote_avarage">{info.voteAverage || ''}</p>
        </span>
        <span
          className="poster-info-add_to_watch_list"
          onClick={handleToggleWatchItem}
        >
          {itemsId.includes(info.mediaId) ? (
            <p className="poster-info-add_to_watch_list-heart">❤</p>
          ) : (
            <p>+</p>
          )}
        </span>
        <p className="poster-info-title">{info.title || ''}</p>
        <p className="poster-info-overview">{`${
          info.overview ? info.overview.slice(0, 95) : ''
        }...`}</p>
      </BrowserView>
    </div>
  )
}

export default PosterCard
