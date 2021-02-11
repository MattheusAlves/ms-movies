import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularMovies } from '@/actions'

interface Props {
  index?: number
  initialData?: Record<string, any>
}
const Movies = (props: Props): JSX.Element => {
  const { data, error, loading } = useGetPopularMovies({
    page: props.index || 1,
    initialData: props.initialData || null
  })
  return data && <RenderItems data={data} key={props.index} />
}

export default Movies
