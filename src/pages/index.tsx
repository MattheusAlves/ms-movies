import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import PosterCard from '@/components/PosterCard'
import { useGetPopularMovies } from '@/actions'

const renderMovies = (data): JSX.Element => {
  return data.results.map(movie => (
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
}
const Index: React.FC = () => {
  const { data, error, loading } = useGetPopularMovies()
  console.log(data)
  console.log(loading)
  return (
    <BaseLayout>
      <BasePage>
        {data && renderMovies(data)}
        {loading && <Loading />}
      </BasePage>
    </BaseLayout>
  )
}

export default Index
