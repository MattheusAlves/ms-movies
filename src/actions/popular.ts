import useSWRInfinite from 'swr/infinite'

import fetcher from '@/util/fetcher'

interface Props {
  initialData: unknown[] | null
}

// One hook for both grids: the SWR keys only differ by resource.
export const useGetPopular = (
  resource: 'movies' | 'series',
  { initialData }: Props
) => {
  const { data, error, ...rest } = useSWRInfinite<unknown>(
    pageIndex => `/api/${resource}/popular?page=${pageIndex + 1}`, // SWR key
    fetcher,
    {
      initialSize: 4,
      fallbackData: initialData ?? undefined,
      persistSize: false
    }
  )
  return { data, error, loading: !data && !error, ...rest }
}
