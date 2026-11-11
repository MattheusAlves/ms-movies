import useSWR from 'swr'
import fetcher from '@/util/fetcher'

interface WatchProviders {
  results?: Record<string, { flatrate?: Array<{ provider_name: string }> }>
}
interface Props {
  mediaType: string
  mediaId: string
}
export const useGetWatchProviders = ({
  mediaType,
  mediaId
}: Props) => {
  const { data, error, ...rest } = useSWR<WatchProviders>(
    `/api/info/watchproviders/${mediaType}/${mediaId}`,
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
