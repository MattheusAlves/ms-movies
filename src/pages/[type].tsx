import { useReducer, useState } from 'react'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import PopularGrid from '@/components/PopularGrid'

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { page: state.page + 3 }
    default:
      throw new Error()
  }
}
const Index = props => {
  const [state, dispatch] = useReducer(reducer, { page: 4 })
  const [size, setSize] = useState(4)
  const router = useRouter()
  const incrementPage = (): void => {
    if (state.page === size) {
      dispatch({ type: 'increment' })
    }
  }
  const setCurrentSize = size => {
    setSize(size)
  }
  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>
        {router.query.type === 'movies' ? (
          <>
            <Head>
              <title>MS - Filmes</title>
            </Head>
            <PopularGrid
              resource="movies"
              initialData={props.initialData}
              index={state.page}
              setCurrentSize={setCurrentSize}
            />
          </>
        ) : (
          <>
            <Head>
              <title>MS - Séries</title>
            </Head>
            <PopularGrid
              resource="series"
              initialData={props.initialData}
              index={state.page}
              setCurrentSize={setCurrentSize}
            />
          </>
        )}
      </BasePage>
    </BaseLayout>
  )
}

export const getStaticProps: GetStaticProps = async context => {
  try {
    const result = await axios.get(
      context.params.type === 'movies'
        ? 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc'
        : 'https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc',
      {
        params: {
          api_key: process.env.API_KEY,
          page: 1
        }
      }
    )
    const titles = [result.data]

    return { props: { initialData: titles }, revalidate: 5600 }
  } catch {
    throw new Error('Unable to load discovery data from TMDB')
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { type: 'movies' } },
      { params: { type: 'series' } }
    ],
    fallback: false
  }
}

export default Index
