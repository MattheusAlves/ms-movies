import { useReducer, useState } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import fetcher from '@/util/fetcher'
import Movies from '@/components/Movies'
import Series from '@/components/Series'

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { page: state.page + 3 }
    default:
      throw new Error()
  }
}
const Index: React.ReactNode = props => {
  const [state, dispatch] = useReducer(reducer, { page: 4 })
  const [size, setSize] = useState(4)
  const incrementPage = (): void => {
    if (state.page === size) {
      dispatch({ type: 'increment' })
      console.log('state.page', state.page)
    }
  }
  const setCurrentSize = size => {
    setSize(size)
  }
  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>
        <Movies
          initialData={props.initialData}
          index={state.page}
          setCurrentSize={setCurrentSize}
        />
      </BasePage>
    </BaseLayout>
  )
}

export const getStaticProps: GetStaticProps = async context => {
  const data = []
  // defines URL for series and movies in that order
  const URL =
    context.params.type === 'series'
      ? `${process.env.BASE_URL}/api/tv/popular?`
      : `${process.env.BASE_URL}/api/movies/popular?`
  const result = await fetcher(`${URL}page=${1}`)
  data.push(result)
  return { props: { initialData: data }, revalidate: 120 }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { type: 'movies' } }, // See the "paths" section below
      { params: { type: 'series' } }
    ],
    fallback: false // See the "fallback" section below
  }
}

export default Index
