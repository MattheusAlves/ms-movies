import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'

vi.mock('next/router', () => ({ useRouter: () => ({ push: vi.fn(), query: { type: 'movies' } }) }))

import PosterCard from '@/components/shared/PosterCard'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'
import { NavigationContext } from '@/contexts/NavigationContext'

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
  push.mockReset()
})

afterEach(() => {
  cleanup()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
})

describe('PosterCard watchlist toggle', () => {
  it('navigates to the selected title', () => {
    renderCard(1)
    fireEvent.click(screen.getByAltText('Fixture 1'))
    expect(push).toHaveBeenCalledWith('/info/movie/1')
  })

  it('toggles the saved state on repeated clicks', () => {
    renderCard(1)
    expect(screen.getByText('+')).toBeInTheDocument()

    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('❤')).toBeInTheDocument()

    fireEvent.click(screen.getByText('❤'))
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('persists through the cookie across a simulated reload', () => {
    const first = renderCard(2)
    fireEvent.click(screen.getByText('+'))
    expect(JSON.parse(Cookies.get('ToWatchList')!)[0].mediaId).toBe(2)
    first.unmount()

    // Fresh provider state reads the cookie on mount, like a page reload.
    renderCard(2)
    expect(screen.getByText('❤')).toBeInTheDocument()
    expect(JSON.parse(Cookies.get('itemsId')!)).toEqual([2])
  })

  it('toggling off leaves an empty saved list', () => {
    renderCard(3)
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('❤'))
    expect(JSON.parse(Cookies.get('ToWatchList')!)).toEqual([])
    expect(JSON.parse(Cookies.get('itemsId')!)).toEqual([])
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
