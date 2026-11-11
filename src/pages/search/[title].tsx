import { GetServerSideProps } from 'next'
import Head from 'next/head'
import axios from 'axios'

import RenderItems from '@/components/shared/RenderItems'
import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'

const Search = (props): JSX.Element => {
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <>
          <Head>
            <title>MS - Search</title>
          </Head>
          <RenderItems data={props.data} />
        </>
      </BasePage>
    </BaseLayout>
  )
}

export default Search

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await axios.get('https://api.themoviedb.org/4/search/multi/', {
    params: {
      api_key: process.env.API_KEY,
      query: context.params.title
    }
  })
  const titles = [result.data]
  return { props: { data: titles } }
}
