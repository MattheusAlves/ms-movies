import { useSWRInfinite } from 'swr'
import fetcher from '@/util/fetcher'
interface returnedData {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
  isValidating?: boolean
  size?: number
  setSize?: (size: number) => Promise<any>
}
interface Props {
  initialData: unknown[]
}
const getMovieKey = pageIndex => {
  // if (pageIndex === 0) return '/api/movies/popular?page=1 '
  return `/api/movies/popular?page=${pageIndex + 1}` // SWR key
}
const getSerieKey = pageIndex => {
  return `/api/series/popular?page=${pageIndex + 1}`
}

export const useGetPopularMovies = ({ initialData }: Props): returnedData => {
  const { data, error, ...rest } = useSWRInfinite(getMovieKey, fetcher, {
    initialSize: 4,
    initialData,
    persistSize: false
  })
  return { data, error, loading: !data && !error, ...rest }
}
export const useGetPopularSeries = ({ initialData }: Props): returnedData => {
  const { data, error, ...rest } = useSWRInfinite(getSerieKey, fetcher, {
    initialSize: 4,
    initialData,
    persistSize: false
  })
  return { data, error, loading: !data && !error, ...rest }
}
