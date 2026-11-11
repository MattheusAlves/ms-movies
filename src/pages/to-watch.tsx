import React, { useContext } from 'react'
import Head from 'next/head'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import RenderItems from '@/components/shared/RenderItems'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'

export default function ToWatchList(): React.JSX.Element {
  const { toWatchList } = useContext(ToWatchListContext)
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <>
          <Head>
            <title>MS - Para Assistir</title>
          </Head>
          {toWatchList && (
            <RenderItems data={[{ results: [...toWatchList] }]} />
          )}
        </>
      </BasePage>
    </BaseLayout>
  )
}
