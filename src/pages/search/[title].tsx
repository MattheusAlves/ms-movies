import { GetServerSideProps } from 'next'
import axios from 'axios'

import RenderItems from '@/components/shared/RenderItems'
import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'

const Search = (props): JSX.Element => {
  console.log(props.data)
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <RenderItems data={props.data} />
      </BasePage>
    </BaseLayout>
  )
}

export default Search

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await axios.get('https://api.themoviedb.org/4/search/multi/', {
    params: {
      api_key: '2d33c77063aa0a5a20bcf4682a1c151c',
      query: context.params.title
    }
  })
  const titles = [result.data]
  return { props: { data: titles } }
}
