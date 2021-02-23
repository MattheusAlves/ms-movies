import useSWR from 'swr'
import fetcher from '@/util/fetcher'

interface returnedData {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
}

export const useGetActors = ({ mediaType, mediaId }): returnedData => {
  const { data, error, ...rest } = useSWR(
    `/api/cast/${mediaType}/${mediaId}`,
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
