import PosterCard from '@/components/shared/PosterCard'
import { normalizeMediaItem } from '@/util/media'

const RenderItems = (props): React.JSX.Element => {
  const { data } = props
  return data.map(titles =>
    titles.results.map(raw => {
      const media = normalizeMediaItem(raw)
      const imagePath = media.posterPath || media.backdropPath
      return (
        <PosterCard
          key={media.mediaId}
          src={
            imagePath
              ? `https://image.tmdb.org/t/p/w300${imagePath}`
              : '/404.png'
          }
          info={media}
        />
      )
    })
  )
}

export default RenderItems
