import { useContext } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { isMobile, BrowserView } from 'react-device-detect'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'
interface Props {
  src: string
  info: {
    title: string
    voteAverage: number
    overview: string
    releaseDate: string
    mediaType: string
    mediaId: number
    ['poster_path']: string
  }
}

const PosterCard = (props: Props): JSX.Element => {
  const { src, info } = props
  const router = useRouter()
  const { addToList, itemsId } = useContext(ToWatchListContext)
  const handleImageError = image => {
    image.target.src = '/404.png'
    image.target.srcset = '/404.png'
  }
  const handlePosterClick = () => {
    router.push(
      `/info/${
        info.mediaType || (router.query.type === 'movies' ? 'movie' : 'tv')
      }/${info.mediaId}`
    )
  }
  const handleAddToWatchList = e => {
    e.stopPropagation()
    addToList(info)
  }
  return (
    <div className="poster-wrapper" onClick={handlePosterClick}>
      <Image
        src={src}
        width={256}
        height={360}
        quality={isMobile ? 30 : 30}
        onError={e => handleImageError(e)}
      />
      <BrowserView viewClassName="poster-info-container">
        <span className="poster-info-vote_avarage-wrapper">
          <p className="poster-info-vote_avarage">{info.voteAverage || ''}</p>
        </span>
        <span
          className="poster-info-add_to_watch_list"
          onClick={e => handleAddToWatchList(e)}
        >
          {itemsId && itemsId.includes(Number(info.mediaId)) ? (
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
