import type { Metadata } from 'next'
import DiscoveryView from '@/app/_discovery/DiscoveryView'
import { loadDiscoveryData } from '@/app/_discovery/discovery-data'

export const metadata: Metadata = { title: 'MS - Movies' }
export const dynamic = 'force-static'
export const revalidate = 5600

export default async function MoviesPage() {
  return <DiscoveryView resource="movies" initialData={await loadDiscoveryData('movies')} />
}
