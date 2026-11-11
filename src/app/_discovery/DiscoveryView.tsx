'use client'

import { useReducer, useState } from 'react'
import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import PopularGrid from '@/components/PopularGrid'
import type { DiscoveryResource } from './discovery-data'

function reducer(state: { page: number }, action: { type: 'increment' }) {
  switch (action.type) {
    case 'increment':
      return { page: state.page + 3 }
    default:
      throw new Error('Unknown discovery action')
  }
}

export default function DiscoveryView({ resource, initialData }: {
  resource: DiscoveryResource
  initialData: unknown[]
}) {
  const [state, dispatch] = useReducer(reducer, { page: 4 })
  const [size, setSize] = useState(4)
  const incrementPage = () => {
    if (state.page === size) dispatch({ type: 'increment' })
  }

  return (
    <BaseLayout>
      <BasePage callback={incrementPage}>
        <PopularGrid resource={resource} initialData={initialData} index={state.page} setCurrentSize={setSize} />
      </BasePage>
    </BaseLayout>
  )
}
