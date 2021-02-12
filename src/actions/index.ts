import useSWR, { useSWRInfinite } from 'swr'
import fetcher from '@/util/fetcher'
interface returnedData {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
}
interface Props {
  page: number
  initialData: any
}
const getKey = pageIndex => {
  console.log('page index', pageIndex + 1)
  // if (pageIndex === 0) return '/api/movies/popular?page=1 '
  return `/api/movies/popular?page=${pageIndex + 1}` // SWR key
}

export const useGetPopularMovies = ({
  page,
  initialData
}: Props): returnedData => {
  const { data, error, ...rest } = useSWRInfinite(getKey, fetcher, {
    initialSize: 2,
    initialData,
    persistSize: true
  })
  return { data, error, loading: !data && !error, ...rest }
}
