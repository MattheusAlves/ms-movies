import Image from 'next/image'
import { isMobile } from 'react-device-detect'

interface Props {
  src: string
  info: {
    title: string
    voteAverage: number
    overview: string
    releaseDate: string
  }
}

const PosterCard = (props: Props): JSX.Element => {
  const { src, info } = props
  const handleImageError = image => {
    image.target.src = '/404.png'
    image.target.srcset = '/404.png'
  }
  return (
    <div className="poster-wrapper">
      <Image
        src={src}
        width={256}
        height={360}
        quality={isMobile ? 30 : 50}
        // nao adicionar priorty=true
        // priority={true}
        // unoptimized={true}
        loading="eager"
        onError={e => handleImageError(e)}
      />
      <div className="poster-info-container">
        <p className="poster-info-overview">{`${info.overview.slice(
          0,
          95
        )}...`}</p>
      </div>
    </div>
  )
}

export default PosterCard
