import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'

const { push, navigation, getPopular } = vi.hoisted(() => ({
  push: vi.fn(),
  navigation: { pathname: '/movies', searchParams: new URLSearchParams() },
  getPopular: vi.fn()
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.searchParams
}))
vi.mock('@/actions/popular', () => ({ useGetPopular: getPopular }))

import { AppProviders } from '@/app/providers'
import DiscoveryView from '@/app/_discovery/DiscoveryView'
import { watchlistConfig } from '@/config/watchlist'

beforeEach(() => {
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  localStorage.clear()
  push.mockReset()
  navigation.searchParams = new URLSearchParams()
  getPopular.mockImplementation((_resource, options) => ({
    data: options.initialData,
    loading: false,
    isValidating: false,
    setSize: vi.fn(async () => []),
    size: 1
  }))
})

afterEach(() => {
  cleanup()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  localStorage.clear()
})

it.each([
  ['movies', '/movies', 'movie'],
  ['series', '/series', 'tv']
] as const)('renders %s and preserves its watchlist media type', (resource, pathname, mediaType) => {
  navigation.pathname = pathname
  render(
    <AppProviders>
      <DiscoveryView resource={resource} initialData={[{ results: [{ id: 101, title: 'Fixture' }] }]} />
    </AppProviders>
  )

  expect(getPopular).toHaveBeenCalledWith(resource, expect.any(Object))
  fireEvent.click(screen.getByText('+'))
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items[0]).toMatchObject({ mediaId: 101, mediaType })
  expect(screen.getByRole('link', { name: 'View Fixture' })).toHaveAttribute('href', `/info/${mediaType}/101`)
})

it('passes browse filters to the popular hook without the unfiltered fallback', () => {
  navigation.pathname = '/movies'
  navigation.searchParams = new URLSearchParams('genre=18&decade=2010')
  render(
    <AppProviders>
      <DiscoveryView resource="movies" initialData={[{ results: [{ id: 101, title: 'Fixture' }] }]} />
    </AppProviders>
  )
  expect(getPopular).toHaveBeenCalledWith('movies', { initialData: null, genre: 18, decade: 2010 })
})

it('announces the end when the last discovery page is empty', () => {
  getPopular.mockReturnValue({
    data: [{ results: [{ id: 101, title: 'Fixture' }] }, { results: [] }],
    loading: false,
    isValidating: false,
    setSize: vi.fn(async () => []),
    size: 2
  })
  render(<AppProviders><DiscoveryView resource="movies" initialData={[{ results: [] }]} /></AppProviders>)
  expect(screen.getByText('You’ve reached the end.')).toBeInTheDocument()
})
