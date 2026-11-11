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
  const { resource, initialData, index, setCurrentSize } = props
  const { data, error, loading, mutate, setSize, size, isValidating } = useGetPopular(resource, {
    initialData: initialData || null
  })
  useEffect(() => {
    if (!isValidating && !loading && index !== undefined) {
      if (size !== index) void setSize(index)
      setCurrentSize(index)
    }
  }, [index, isValidating, loading, setCurrentSize, setSize, size])
  return (
    <>
      {data && <RenderItems data={data} />}
      {data && isValidating && <LoadingCard />}
      {error && (
        <div className="status-message" role="alert">
          <p>Unable to refresh titles. Please try again.</p>
          <button type="button" onClick={() => { void mutate() }}>Retry</button>
        </div>
      )}
    </>
  )
}

export default PopularGrid
