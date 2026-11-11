import useSWRInfinite from 'swr/infinite'

import fetcher from '@/util/fetcher'

interface SwrResult {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
  isValidating?: boolean
  size?: number
  setSize?: (size: number) => Promise<any>
}

interface Props {
  initialData: unknown[]
}

// One hook for both grids: the SWR keys only differ by resource.
export const useGetPopular = (
  resource: 'movies' | 'series',
  { initialData }: Props
): SwrResult => {
  const { data, error, ...rest } = useSWRInfinite(
    pageIndex => `/api/${resource}/popular?page=${pageIndex + 1}`, // SWR key
    fetcher,
    {
      initialSize: 4,
      fallbackData: initialData,
      persistSize: false
    }
  )
  return { data, error, loading: !data && !error, ...rest }
}
