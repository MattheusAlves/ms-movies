'use client'

import BaseLayout from '@/components/layouts/BaseLayout'
import PopularGrid from '@/components/PopularGrid'
import type { DiscoveryResource } from './discovery-data'
import type { MediaPage } from '@/util/tmdb'

export default function DiscoveryView({ resource, initialData }: {
  resource: DiscoveryResource
  initialData: MediaPage[]
}) {
  const movies = resource === 'movies'
  return (
    <BaseLayout>
      <main id="main-content" className="page-shell" tabIndex={-1}>
        <header className="page-heading">
          <div className="section-rule"><h1>Popular {movies ? 'movies' : 'series'}</h1><span>Powered by TMDB</span></div>
        </header>
        <PopularGrid resource={resource} initialData={initialData} />
      </main>
    </BaseLayout>
  )
}
