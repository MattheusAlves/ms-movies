import Image from 'next/image'
import { useRouter } from 'next/router'
import { isMobile, BrowserView } from 'react-device-detect'

interface Props {
  src: string
  info: {
    title: string
    voteAverage: number
    overview: string
    releaseDate: string
    mediaType: string
    mediaId: string
  }
}

const PosterCard = (props: Props): JSX.Element => {
  const { src, info } = props
  const router = useRouter()
  const handleImageError = image => {
    image.target.src = '/404.png'
    image.target.srcset = '/404.png'
  }
  return (
    <div
      className="poster-wrapper"
      onClick={() =>
        router.push(
          `/info/${
            info.mediaType || router.query.type === 'movies' ? 'movie' : 'tv'
          }/${info.mediaId}`
        )
      }
    >
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
        <p className="poster-info-title">{info.title || ''}</p>
        <p className="poster-info-overview">{`${
          info.overview ? info.overview.slice(0, 95) : ''
        }...`}</p>
      </BrowserView>
    </div>
  )
}

export default PosterCard
