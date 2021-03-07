import useSWR from 'swr'
import fetcher from '@/util/fetcher'

interface returnedData {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
}
interface Props {
  mediaType: string
  mediaId: string
}
export const useGetTrailer = ({ mediaType, mediaId }: Props): returnedData => {
  const { data, error, ...rest } = useSWR(
    `/api/info/trailer/${mediaType}/${mediaId}`,
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
