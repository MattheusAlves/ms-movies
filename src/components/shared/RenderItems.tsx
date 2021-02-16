import PosterCard from '@/components/shared/PosterCard'

const RenderItems = (props): JSX.Element => {
  const { data } = props
  return data.map(movies =>
    movies.results.map(movie => (
      <PosterCard
        src={`https://image.tmdb.org/t/p/w300/${movie.poster_path}`}
        info={{
          title: movie.title,
          overview: movie.overview,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average
        }}
        key={movie.id}
      />
    ))
  )
}

export default RenderItems