import PosterCard from '@/components/shared/PosterCard'

const RenderItems = (props): JSX.Element => {
  const { data } = props
  return data.map(titles =>
    titles.results.map(title => (
      <PosterCard
        src={`https://image.tmdb.org/t/p/w300${
          title.poster_path ? title.poster_path : title.background_path
        }`}
        info={{
          title: title.title || title.name,
          overview: title.overview,
          releaseDate: title.release_date,
          voteAverage: title.vote_average,
          mediaType: title.media_type,
          mediaId: title.id
        }}
        key={title.id}
      />
    ))
  )
}

export default RenderItems
