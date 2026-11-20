import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/search/fixture'
}))

import { AppProviders } from '@/app/providers'
import SearchResults from '@/app/search/[title]/SearchResults'
import { watchlistConfig } from '@/config/watchlist'

beforeEach(() => {
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  localStorage.clear()
  push.mockReset()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  localStorage.clear()
})

it('navigates and persists the watchlist on the App Router search page', () => {
  const { container } = render(
    <AppProviders>
      <SearchResults query="fixture" data={[{ results: [{ id: 101, title: 'Fixture Movie', media_type: 'movie' }] }]} />
    </AppProviders>
  )
  fireEvent.click(screen.getByText('+'))
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items[0]).toMatchObject({ mediaId: 101, mediaType: 'movie' })

  fireEvent.change(screen.getByLabelText('Search movies and series'), { target: { value: 'Space & Time' } })
  fireEvent.submit(container.querySelector('form')!)
  expect(push).toHaveBeenCalledWith('/search/Space%20%26%20Time')
})

it('filters supported result types and ignores people', () => {
  render(
    <AppProviders>
      <SearchResults query="fixture" data={[{ results: [
        { id: 101, title: 'A Movie', media_type: 'movie' },
        { id: 202, name: 'A Series', media_type: 'tv' },
        { id: 303, name: 'A Person', media_type: 'person' }
      ] }]} />
    </AppProviders>
  )
  expect(screen.getByRole('link', { name: 'View A Movie' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'View A Series' })).toBeInTheDocument()
  expect(screen.queryByText('A Person')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Movies' }))
  expect(screen.getByRole('button', { name: 'Movies' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('1 title shown')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'View A Series' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Series' }))
  expect(screen.getByRole('link', { name: 'View A Series' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'View A Movie' })).not.toBeInTheDocument()
})

it('explains empty search results', () => {
  render(<AppProviders><SearchResults query="nothing" data={[{ results: [] }]} /></AppProviders>)
  expect(screen.getByText('No titles found. Try another search.')).toBeInTheDocument()
})

it('explains that filters only cover loaded results and suggests loading more for an empty filter', () => {
  render(<AppProviders><SearchResults query="fixture" data={[{ total_pages: 2, results: [{ id: 101, title: 'A Movie', media_type: 'movie' }] }]} /></AppProviders>)
  expect(screen.getByText('Filters apply to loaded results.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Series' }))
  expect(screen.getByText('0 titles shown')).toBeInTheDocument()
  expect(screen.getByText('No series in these results. Load more or try another filter.')).toBeInTheDocument()
})

it('does not suggest there are no titles anywhere when the first page has no supported results', () => {
  render(<AppProviders><SearchResults query="fixture" data={[{ total_pages: 2, results: [{ id: 303, name: 'A Person', media_type: 'person' }] }]} /></AppProviders>)
  expect(screen.getByText('No titles in the loaded results. Load more or try another search.')).toBeInTheDocument()
})

it('discards an in-flight page when the search query changes', async () => {
  let resolveFetch!: (response: Response) => void
  const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>(resolve => { resolveFetch = resolve }))
  vi.stubGlobal('fetch', fetchMock)
  const { rerender } = render(<AppProviders><SearchResults query="first" data={[{ total_pages: 2, results: [] }]} /></AppProviders>)
  fireEvent.click(screen.getByRole('button', { name: 'Load more results' }))
  const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal
  rerender(<AppProviders><SearchResults query="second" data={[{ total_pages: 1, results: [{ id: 202, name: 'New Series', media_type: 'tv' }] }]} /></AppProviders>)
  expect(signal.aborted).toBe(true)
  await act(async () => {
    resolveFetch({ ok: true, json: async () => ({ results: [{ id: 101, title: 'Old Movie', media_type: 'movie' }] }) } as Response)
  })
  expect(screen.getByRole('link', { name: 'View New Series' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'View Old Movie' })).not.toBeInTheDocument()
})
