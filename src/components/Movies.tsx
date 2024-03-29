import { useEffect } from 'react'

import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularMovies } from '@/actions/popular'
import LoadingCard from '@/components/shared/LoadingCard'
interface Props {
  index?: number
  initialData?: unknown[]
  setCurrentSize: (number) => void
}
const Movies = (props: Props): JSX.Element => {
  const { data, loading, setSize, isValidating } = useGetPopularMovies({
    initialData: props.initialData || null
  })
  useEffect(() => {
    if (!isValidating && !loading) {
      setSize(props.index)
      props.setCurrentSize(props.index)
    }
  }, [props.index])
  return (
    <>
      {data && <RenderItems data={data} />}
      {/* {loading && <Loading />} */}
      {data && isValidating && <LoadingCard />}
    </>
  )
}

export default Movies
