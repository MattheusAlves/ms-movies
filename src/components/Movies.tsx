import { useEffect } from 'react'

import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularMovies } from '@/actions'

interface Props {
  index?: number
  initialData?: Record<string, any>
}
const Movies = (props: Props): JSX.Element => {
  const { data, error, loading, size, setSize } = useGetPopularMovies({
    page: props.index || 1,
    initialData: props.initialData || null
  })
  useEffect(() => {
    setSize(props.index)
  }, [props.index])
  return data && <RenderItems data={data} />
}

export default Movies
