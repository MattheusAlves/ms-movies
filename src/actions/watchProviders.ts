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
export const useGetWatchProviders = ({
  mediaType,
  mediaId
}: Props): returnedData => {
  const { data, error, ...rest } = useSWR(
    `/api/info/watchproviders/${mediaType}/${mediaId}`,
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
