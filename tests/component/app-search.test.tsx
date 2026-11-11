import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
  localStorage.clear()
})

it('navigates and persists the watchlist on the App Router search page', () => {
  const { container } = render(
    <AppProviders>
      <SearchResults data={[{ results: [{ id: 101, title: 'Fixture Movie', media_type: 'movie' }] }]} />
    </AppProviders>
  )
  fireEvent.click(screen.getByText('+'))
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items[0]).toMatchObject({ mediaId: 101, mediaType: 'movie' })

  fireEvent.change(screen.getByLabelText('Search movies and series'), { target: { value: 'Space & Time' } })
  fireEvent.submit(container.querySelector('form')!)
  expect(push).toHaveBeenCalledWith('/search/Space%20%26%20Time')
})
