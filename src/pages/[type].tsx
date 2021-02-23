import { useReducer, useState } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import axios from 'axios'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
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
          <Movies
            initialData={props.initialData}
            index={state.page}
            setCurrentSize={setCurrentSize}
          />
        ) : (
          <Series
            initialData={props.initialData}
            index={state.page}
            setCurrentSize={setCurrentSize}
          />
        )}
      </BasePage>
    </BaseLayout>
  )
}

export const getStaticProps: GetStaticProps = async context => {
  const result = await axios.get(
    context.params.type === 'movies'
      ? 'https://api.themoviedb.org/4/discover/movie?sort_by=popularity.desc'
      : 'https://api.themoviedb.org/4/discover/tv?sort_by=popularity.desc',
    {
      params: {
        api_key: '2d33c77063aa0a5a20bcf4682a1c151c',
        page: 1
      }
    }
  )
  const titles = [result.data]

  return { props: { initialData: titles }, revalidate: 3600 }
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
