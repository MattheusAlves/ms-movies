import type { Metadata } from 'next'
import { searchTitles } from './search-data'
import SearchResults from './SearchResults'

export const metadata: Metadata = { title: 'MS - Search' }
// Search results were request-rendered in the Pages Router; keep them fresh.
export const dynamic = 'force-dynamic'

export default async function SearchPage({ params }: { params: Promise<{ title: string }> }) {
  const { title } = await params
  const data = await searchTitles(title)
  return <SearchResults data={data} />
}
