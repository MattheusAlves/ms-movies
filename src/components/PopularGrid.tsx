import { useEffect, useRef } from 'react'
import RenderItems from '@/components/shared/RenderItems'
import { useGetPopular } from '@/actions/popular'
import type { MediaPage } from '@/util/tmdb'

interface Props {
  resource: 'movies' | 'series'
  initialData: MediaPage[]
}

export default function PopularGrid({ resource, initialData }: Props): React.JSX.Element {
  const { data, error, loading, mutate, setSize, size, isValidating } = useGetPopular(resource, { initialData })
  const lastPage = data?.at(-1)
  const loadingMore = isValidating && size > (data?.length ?? 0)
  const hasMore = !!lastPage?.results.length && (data?.length ?? 0) < Math.min(lastPage.total_pages ?? 500, 500)
  const sentinel = useRef<HTMLDivElement>(null)
  const requested = useRef(false)

  useEffect(() => {
    const target = sentinel.current
    if (!target || !hasMore || error || isValidating) return
    const load = () => {
      if (requested.current) return
      requested.current = true
      void setSize(current => current + 1).catch(() => {}).finally(() => { requested.current = false })
    }
    if (typeof globalThis.IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) load()
      }, { rootMargin: '300px' })
      observer.observe(target)
      return () => observer.disconnect()
    }
    // Older browsers retain automatic loading without requiring a button.
    const check = () => { if (target.getBoundingClientRect().top <= window.innerHeight + 300) load() }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [error, hasMore, isValidating, setSize])

  return (
    <>
      {data && <RenderItems data={data} />}
      {loading && <p className="empty-state" role="status">Loading titles…</p>}
      {data && !data.some(page => page.results.length) && !loading && <p className="empty-state">No titles are available right now.</p>}
      {error && (
        <div className="status-message" role="alert">
          <p>Unable to refresh titles. Please try again.</p>
          <button className="button button--outline" type="button" onClick={() => { void mutate() }}>Retry</button>
        </div>
      )}
      {hasMore && !error && <div className="scroll-sentinel" ref={sentinel} aria-hidden="true" />}
      {loadingMore && <p className="pagination-status" role="status">Loading more titles…</p>}
      {!hasMore && !loading && data?.some(page => page.results.length > 0) && <p className="pagination-status">You’ve reached the end.</p>}
    </>
  )
}
