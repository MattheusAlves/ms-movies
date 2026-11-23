import useSWR from 'swr'
import fetcher from '@/util/fetcher'
import { endpoint } from '@/config/endpoint'

interface Provider { provider_id?: number; provider_name: string }
interface WatchProviders {
  results?: Record<string, { flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; free?: Provider[]; ads?: Provider[] }>
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
    endpoint.api.watchProviders(mediaType, mediaId),
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
