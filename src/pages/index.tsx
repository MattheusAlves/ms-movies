import { useState, useEffect } from 'react'
import Loading from '@/components/Loading'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import RenderItems from '@/components/RenderItems'
import { useGetPopularMovies } from '@/actions'
import fetcher from '@/util/fetcher'

export async function getServerSideProps() {
  const data = await fetcher('http://localhost:3000/api/movies/popular?page=1')
  return { props: { data } }
}
const Index: React.ReactNode = props => {
  const { data, error, loading } = useGetPopularMovies({
    page: 1,
    initialData: props.data
  })
  const incrementPage = page => {}

  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>
        {data && <RenderItems data={data} />}
        {loading && <Loading />}
      </BasePage>
    </BaseLayout>
  )
}

export default Index
