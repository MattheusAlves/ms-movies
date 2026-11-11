import useSWR from 'swr'
import fetcher from '@/util/fetcher'
import { endpoint } from '@/config/endpoint'

interface Props {
  mediaType: string
  mediaId: string
}
export const useGetTrailer = ({ mediaType, mediaId }: Props) => {
  const { data, error, ...rest } = useSWR<{ results: Array<{ key: string }> }>(
    endpoint.api.trailer(mediaType, mediaId),
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
