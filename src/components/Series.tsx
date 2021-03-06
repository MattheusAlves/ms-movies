import { useEffect, useContext } from 'react'

import RenderItems from '@/components/shared/RenderItems'
import { useGetPopularSeries } from '@/actions/popular'
import Loading from '@/components/shared/Loading'
import LoadingCard from '@/components/shared/LoadingCard'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'

interface Props {
  index?: number
  initialData?: unknown[]
  setCurrentSize: (number) => void
}
const Series = (props: Props): JSX.Element => {
  const {
    data,
    error,
    // loading,
    size,
    setSize,
    isValidating
  } = useGetPopularSeries({
    initialData: props.initialData || null
  })
  const { loading, toggleLoading } = useContext(ContentTypeContext)
  useEffect(() => {
    if (!isValidating && !loading) {
      setSize(props.index)
      props.setCurrentSize(props.index)
    }
    toggleLoading(false)
  }, [props.index])
  return (
    <>
      {data && <RenderItems data={data} />}
      {data && isValidating && <LoadingCard />}
    </>
  )
}

export default Series
