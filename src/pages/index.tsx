import { useReducer } from 'react'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import fetcher from '@/util/fetcher'
import Movies from '@/components/Movies'

export async function getServerSideProps() {
  const data = []
  for (let i = 1; i < 3; i++) {
    const result = await fetcher(
      `${process.env.BASE_URL}/api/movies/popular?page=${i}`
    )
    data.push(result)
  }
  return { props: { data } }
}
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { page: state.page + 3 }
    default:
      throw new Error()
  }
}
const Index: React.ReactNode = props => {
  const [state, dispatch] = useReducer(reducer, { page: 2 })
  const incrementPage = (): void => {
    console.log('call increment')
    dispatch({ type: 'increment' })
  }

  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>
        <Movies initialData={props.initialData} index={state.page} />
      </BasePage>
    </BaseLayout>
  )
}

export default Index
