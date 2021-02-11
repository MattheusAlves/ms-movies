import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularMovies } from '@/actions'

const Movies = (props): JSX.Element => {
  const { data, error, loading } = useGetPopularMovies({
    page: props.index || 1,
    initialData: props.initialData || null
  })
  return data && <RenderItems data={data} key={props.index} />
}

export default Movies
