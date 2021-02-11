import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import fetcher from '@/util/fetcher'
import Movies from '@/components/Movies'

export async function getServerSideProps() {
  const data = await fetcher('http://localhost:3000/api/movies/popular?page=1')
  return { props: { data } }
}
const Index: React.ReactNode = props => {
  const pages = []
  pages.push(<Movies initialData={props.data} key={1} />)
  const incrementPage = page => {
    if (page < props.data.total_pages) {
      pages.push(<Movies index={page} key={page} />)
    }
  }

  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>{pages}</BasePage>
    </BaseLayout>
  )
}

export default Index
