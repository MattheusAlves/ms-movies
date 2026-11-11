'use client'

import { useContext } from 'react'
import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import RenderItems from '@/components/shared/RenderItems'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'

export default function WatchlistView() {
  const { toWatchList } = useContext(ToWatchListContext)
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <>{toWatchList && <RenderItems data={[{ results: [...toWatchList] }]} />}</>
      </BasePage>
    </BaseLayout>
  )
}
