import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'

import PosterCard from '@/components/shared/PosterCard'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'
import { NavigationContext } from '@/contexts/NavigationContext'
import { watchlistConfig } from '@/config/watchlist'

const push = vi.fn()

const card = (mediaId: number) => ({
  title: `Fixture ${mediaId}`,
  overview: 'Overview',
  releaseDate: '2026-01-01',
  voteAverage: 7,
  mediaType: 'movie',
  mediaId,
  posterPath: '/p.jpg',
  backdropPath: ''
})

const renderCard = (mediaId: number) =>
  render(
    <NavigationContext.Provider value={{ pathname: '/movies', push }}>
      <ToWatchListProvider>
        <PosterCard src="/p.jpg" info={card(mediaId)} />
      </ToWatchListProvider>
    </NavigationContext.Provider>
  )

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

describe('PosterCard watchlist toggle', () => {
  it('navigates to the selected title', () => {
    renderCard(1)
    expect(screen.getByRole('link', { name: 'View Fixture 1' })).toHaveAttribute('href', '/info/movie/1')
  })

  it('toggles the saved state on repeated clicks', () => {
    renderCard(1)
    expect(screen.getByRole('button', { name: 'Add Fixture 1 to watchlist' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add Fixture 1 to watchlist' }))
    expect(screen.getByRole('button', { name: 'Remove Fixture 1 from watchlist' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Remove Fixture 1 from watchlist' }))
    expect(screen.getByRole('button', { name: 'Add Fixture 1 to watchlist' })).toBeInTheDocument()
  })

  it('persists through versioned storage across a simulated reload', () => {
    const first = renderCard(2)
    fireEvent.click(screen.getByText('+'))
    expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items[0].mediaId).toBe(2)
    first.unmount()

    // Fresh provider state reads versioned storage on mount, like a page reload.
    renderCard(2)
    expect(screen.getByRole('button', { name: 'Remove Fixture 2 from watchlist' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items).toHaveLength(1)
  })

  it('toggling off leaves an empty saved list', () => {
    renderCard(3)
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Fixture 3 from watchlist' }))
    expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items).toEqual([])
  })

  it('stops propagation so the poster click does not navigate', () => {
    renderCard(4)
    let navigated = false
    // React 19 delegates events at the render root; a listener above the root
    // only fires if the toggle handler did not stop the native propagation.
    document.body.addEventListener('click', () => (navigated = true))
    fireEvent.click(screen.getByText('+'))
    expect(navigated).toBe(false)
  })
})
