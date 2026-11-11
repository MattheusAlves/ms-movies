import useSWR from 'swr'
import fetcher from '@/util/fetcher'

interface Actor {
  id: number
  profile_path: string | null
  original_name?: string
  name?: string
  character?: string
}

export const useGetActors = ({ mediaType, mediaId }) => {
  const { data, error, ...rest } = useSWR<Actor[]>(
    `/api/cast/${mediaType}/${mediaId}`,
    fetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
