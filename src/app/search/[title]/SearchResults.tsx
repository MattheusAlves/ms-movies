'use client'

import BaseLayout from '@/components/layouts/BaseLayout'
import BasePage from '@/components/layouts/BasePage'
import RenderItems from '@/components/shared/RenderItems'

export default function SearchResults({ data }: { data: unknown[] }) {
  return (
    <BaseLayout>
      <BasePage callback={() => null}>
        <RenderItems data={data} />
      </BasePage>
    </BaseLayout>
  )
}
