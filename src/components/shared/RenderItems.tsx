import PosterCard from '@/components/shared/PosterCard'
import { normalizeMediaItem } from '@/util/media'
import { endpoint } from '@/config/endpoint'
import { imageConfig } from '@/config/images'
import type { RawMediaItem } from '@/util/media'

const RenderItems = ({ data }: { data: Array<{ results: RawMediaItem[] }> }): React.JSX.Element => {
  return <div className="poster-grid">{data.map((titles, pageIndex) =>
    titles.results.map((raw, itemIndex) => {
      const media = normalizeMediaItem(raw)
      const image = media.posterPath
        ? endpoint.tmdb.image(imageConfig.posterWidth, media.posterPath)
        : media.backdropPath
          ? endpoint.tmdb.image(imageConfig.backdropWidth, media.backdropPath)
          : '/404.png'
      return (
        <PosterCard
          key={`${pageIndex}:${media.mediaType}:${media.mediaId}`}
          src={image}
          info={media}
          featured={pageIndex === 0 && itemIndex === 0}
        />
      )
    })
  )}</div>
}

export default RenderItems
