import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'

const { push, navigation, getPopular } = vi.hoisted(() => ({
  push: vi.fn(),
  navigation: { pathname: '/movies' },
  getPopular: vi.fn()
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => navigation.pathname
}))
vi.mock('@/actions/popular', () => ({ useGetPopular: getPopular }))

import { AppProviders } from '@/app/providers'
import DiscoveryView from '@/app/_discovery/DiscoveryView'

beforeEach(() => {
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  push.mockReset()
  getPopular.mockImplementation((_resource, options) => ({
    data: options.initialData,
    loading: false,
    isValidating: false,
    setSize: vi.fn()
  }))
})

afterEach(() => {
  cleanup()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
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
  expect(JSON.parse(Cookies.get('ToWatchList')!)[0]).toMatchObject({ mediaId: 101, mediaType })
  fireEvent.click(screen.getByAltText('Fixture'))
  expect(push).toHaveBeenCalledWith(`/info/${mediaType}/101`)
})
