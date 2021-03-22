import React, { useContext } from 'react'
import Head from 'next/head'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import RenderItems from '@/components/shared/RenderItems'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'

export default function ToWatchList(): JSX.Element {
  const { ToWatchList } = useContext(ToWatchListContext)
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <>
          <Head>
            <title>MS - Para Assistir</title>
          </Head>
          {ToWatchList && (
            <RenderItems data={[{ results: [...ToWatchList] }]} />
          )}
        </>
      </BasePage>
    </BaseLayout>
  )
}
