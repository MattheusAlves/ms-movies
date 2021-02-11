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

export const useGetPopularMovies = ({
  page,
  initialData
}: Props): returnedData => {
  const { data, error, ...rest } = useSWR(
    `/api/movies/popular?page=${page}`,
    fetcher,
    {
      initialData
    }
  )
  return { data, error, loading: !data && !error, ...rest }
}
