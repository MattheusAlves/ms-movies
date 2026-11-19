import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/router', () => ({ useRouter: () => ({ push: vi.fn(), query: { type: 'movies' } }) }))

import RenderItems from '@/components/shared/RenderItems'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'
import { NavigationContext } from '@/contexts/NavigationContext'

const pages = [
  {
    results: [
      {
        id: 12,
        title: 'A movie',
        overview: 'Movie overview',
        release_date: '2026-01-01',
        vote_average: 8,
        media_type: 'movie',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg'
      },
      { id: 13, name: 'A series', backdrop_path: '/backdrop.jpg', media_type: 'tv' }
    ]
  },
  {
    results: [
      {
        mediaId: 14,
        title: 'Saved',
        releaseDate: '2025-01-01',
        voteAverage: 7,
        mediaType: 'tv'
      }
    ]
  }
]

const renderItems = () =>
  render(
    <NavigationContext.Provider value={{ pathname: '/movies', push: () => {} }}>
      <ToWatchListProvider>
        <RenderItems data={pages} />
      </ToWatchListProvider>
    </NavigationContext.Provider>
  )

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); localStorage.clear() })

describe('RenderItems', () => {
  it('renders one poster card per item across all pages', () => {
    renderItems()
    expect(screen.getByAltText('A movie')).toBeInTheDocument()
    expect(screen.getByAltText('A series')).toBeInTheDocument()
    expect(screen.getByAltText('Saved')).toBeInTheDocument()
  })

  it('builds the TMDB image URL from the poster, falling back to the backdrop', () => {
    renderItems()
    expect(screen.getByAltText('A movie').getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg'
    )
    expect(screen.getByAltText('A series').getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w300/backdrop.jpg'
    )
  })

  it('falls back to the local placeholder when there is no image', () => {
    renderItems()
    expect(screen.getByAltText('Saved').getAttribute('src')).toBe('/404.png')
  })

  it('prioritizes the first poster and lazy-loads the rest', () => {
    renderItems()
    expect(screen.getByAltText('A movie')).toHaveAttribute('loading', 'eager')
    expect(screen.getByAltText('A movie')).toHaveAttribute('fetchPriority', 'high')
    expect(screen.getByAltText('A series')).toHaveAttribute('loading', 'lazy')
  })

  it('shows the title, release year, and accessible rating', () => {
    renderItems()
    expect(screen.getByText('A movie')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByLabelText('TMDB rating 8.0 out of 10')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View A movie' })).toHaveAccessibleDescription('Movie overview')
  })
})
