import useSWRInfinite from 'swr/infinite'

import fetcher from '@/util/fetcher'
import { endpoint } from '@/config/endpoint'
import type { MediaPage } from '@/util/tmdb'

interface Props {
  initialData: MediaPage[] | null
  genre?: number | null
  decade?: number | null
}

// One hook for both grids: the SWR keys only differ by resource and filters.
export const useGetPopular = (
  resource: 'movies' | 'series',
  { initialData, genre = null, decade = null }: Props
) => {
  const { data, error, ...rest } = useSWRInfinite<MediaPage>(
    (pageIndex, previousPage) => {
      if (previousPage && (previousPage.results.length === 0 || (previousPage.total_pages !== undefined && pageIndex >= previousPage.total_pages))) return null
      return endpoint.api.popular(resource, pageIndex + 1, { genre, decade })
    },
    fetcher,
    {
      initialSize: 1,
      fallbackData: initialData ?? undefined,
      persistSize: false
    }
  )
  return { data, error, loading: !data && !error, ...rest }
}
