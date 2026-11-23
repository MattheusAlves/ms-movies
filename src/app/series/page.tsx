import type { Metadata } from 'next'
import { Suspense } from 'react'
import DiscoveryView from '@/app/_discovery/DiscoveryView'
import { loadDiscoveryData } from '@/app/_discovery/discovery-data'

export const metadata: Metadata = { title: 'MS - Series' }
export const dynamic = 'force-static'
export const revalidate = 5600

export default async function SeriesPage() {
  return <Suspense fallback={<main id="main-content" className="page-shell" tabIndex={-1} />}><DiscoveryView resource="series" initialData={await loadDiscoveryData('series')} /></Suspense>
}
