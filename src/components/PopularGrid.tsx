import { useEffect } from 'react'

import RenderItems from '@/components/shared/RenderItems'
import LoadingCard from '@/components/shared/LoadingCard'
import { useGetPopular } from '@/actions/popular'

interface Props {
  resource: 'movies' | 'series'
  index?: number
  initialData?: unknown[]
  setCurrentSize: (size: number) => void
}

// Shared grid for /movies and /series: only the SWR resource differs.
const PopularGrid = (props: Props): React.JSX.Element => {
  const { data, loading, setSize, isValidating } = useGetPopular(props.resource, {
    initialData: props.initialData || null
  })
  useEffect(() => {
    if (!isValidating && !loading) {
      setSize(props.index)
      props.setCurrentSize(props.index)
    }
    // Deliberately narrow deps: re-run only when the target page changes.
  }, [props.index])
  return (
    <>
      {data && <RenderItems data={data} />}
      {data && isValidating && <LoadingCard />}
    </>
  )
}

export default PopularGrid
