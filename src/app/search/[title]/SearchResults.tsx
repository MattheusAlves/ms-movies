'use client'

import { useEffect, useRef, useState } from 'react'
import BaseLayout from '@/components/layouts/BaseLayout'
import RenderItems from '@/components/shared/RenderItems'
import { endpoint } from '@/config/endpoint'
import { tmdbConfig } from '@/config/tmdb'
import type { MediaPage } from '@/util/tmdb'

type Filter = 'all' | 'movie' | 'tv'

export default function SearchResults({ data, query }: { data: MediaPage[]; query: string }) {
  return <SearchResultsForQuery key={query} initialData={data} query={query} />
}

function SearchResultsForQuery({ initialData, query }: { initialData: MediaPage[]; query: string }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [pages, setPages] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => { request.current?.abort() }, [])

  const titles = pages.flatMap(page => page.results).filter(item => item.media_type === 'movie' || item.media_type === 'tv')
  const visible = filter === 'all' ? titles : titles.filter(item => item.media_type === filter)
  const hasMorePages = pages.length < Math.min(pages.at(-1)?.total_pages ?? 0, tmdbConfig.maxPage)
  const reachedPageLimit = pages.length >= tmdbConfig.maxPage && (pages.at(-1)?.total_pages ?? 0) > tmdbConfig.maxPage

  const loadMore = async () => {
    if (request.current || !hasMorePages) return
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError(false)
    try {
      const response = await fetch(endpoint.api.search(query, pages.length + 1), { signal: controller.signal })
      if (!response.ok) throw new Error('Search request failed')
      const page: MediaPage = await response.json()
      if (!controller.signal.aborted) setPages(current => [...current, page])
    } catch {
      if (!controller.signal.aborted) setError(true)
    } finally {
      if (!controller.signal.aborted) {
        request.current = null
        setLoading(false)
      }
    }
  }

  return (
    <BaseLayout>
      <main id="main-content" className="page-shell" tabIndex={-1}>
        <header className="page-heading">
          <div className="heading-row"><h1>Search results</h1><p>Titles matching <strong>“{query}”</strong></p></div>
          <div className="section-rule"><span aria-live="polite">{visible.length} {visible.length === 1 ? 'title' : 'titles'} shown</span><span>Movies &amp; series</span></div>
          {hasMorePages && <p className="search-page-note">Filters apply to loaded results.</p>}
        </header>
        <div className="filter-bar" role="group" aria-label="Filter results">
          {([['all', 'All'], ['movie', 'Movies'], ['tv', 'Series']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        {visible.length ? <RenderItems data={[{ results: visible }]} /> : <p className="empty-state">{filter === 'all' ? (hasMorePages ? 'No titles in the loaded results. Load more or try another search.' : 'No titles found. Try another search.') : `No ${filter === 'movie' ? 'movies' : 'series'} in these results. ${hasMorePages ? 'Load more or try another filter.' : 'Try another filter or search.'}`}</p>}
        {error && <p className="status-message" role="alert">Unable to load more results. Please try again.</p>}
        {(hasMorePages || pages.length > 1) && <div className="search-pagination"><button className="button button--outline" type="button" onClick={() => { void loadMore() }} aria-disabled={loading || !hasMorePages}><span aria-live="polite">{loading ? 'Loading more results…' : error ? 'Retry loading results' : hasMorePages ? 'Load more results' : reachedPageLimit ? 'Search page limit reached' : 'All results loaded'}</span></button></div>}
      </main>
    </BaseLayout>
  )
}
