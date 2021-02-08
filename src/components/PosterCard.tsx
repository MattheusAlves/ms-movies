import Image from 'next/image'

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
  return (
    <div className="poster-wrapper">
      <Image src={src} width={256} height={360} />
      <div className="poster-info-container">
        <p className="poster-info-overview">{info.overview}</p>
      </div>
    </div>
  )
}

export default PosterCard
