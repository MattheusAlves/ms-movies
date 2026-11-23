'use client'

import { useSearchParams } from 'next/navigation'
import BaseLayout from '@/components/layouts/BaseLayout'
import CoverHero from '@/components/shared/CoverHero'
import PopularGrid from '@/components/PopularGrid'
import type { DiscoveryResource } from './discovery-data'
import type { MediaPage } from '@/util/tmdb'

export default function DiscoveryView({ resource, initialData }: {
  resource: DiscoveryResource
  initialData: MediaPage[]
}) {
  const movies = resource === 'movies'
  const searchParams = useSearchParams()
  const genreParam = searchParams?.get('genre')
  const genre = genreParam && /^\d+$/.test(genreParam) ? Number(genreParam) : null
  const decadeParam = searchParams?.get('decade')
  const decade = decadeParam && /^(19|20)\d{2}$/.test(decadeParam) ? Number(decadeParam) : null
  const cover = initialData[0]?.results?.[0]
  const hasCover = !!cover && !!(cover.backdrop_path || cover.poster_path) && !!cover.overview

  return (
    <BaseLayout>
      <main id="main-content" className="page-shell" tabIndex={-1}>
        {hasCover && cover && <CoverHero item={cover} resource={resource} />}
        <header className="page-heading discovery-heading">
          <div className="section-rule">
            <h1>{movies ? 'Popular movies' : 'Popular series'}</h1>
          </div>
        </header>
        <PopularGrid resource={resource} initialData={initialData} genre={genre} decade={decade} />
      </main>
    </BaseLayout>
  )
}
