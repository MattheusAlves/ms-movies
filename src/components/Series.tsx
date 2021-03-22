import { useEffect } from 'react'

import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularSeries } from '@/actions/popular'
import LoadingCard from '@/components/shared/LoadingCard'

interface Props {
  index?: number
  initialData?: unknown[]
  setCurrentSize: (number) => void
}
const Series = (props: Props): JSX.Element => {
  const {
    data,
    error,
    loading,
    size,
    setSize,
    isValidating
  } = useGetPopularSeries({
    initialData: props.initialData || null
  })
  useEffect(() => {
    if (!isValidating && !loading) {
      setSize(props.index)
      props.setCurrentSize(props.index)
    }
  }, [props.index])
  return (
    <>
      {data && <RenderItems data={data} />}
      {data && isValidating && <LoadingCard />}
    </>
  )
}

export default Series
