import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'
import { watchlistConfig } from '@/config/watchlist'
import Header from '@/components/shared/Header'
import PosterCard from '@/components/shared/PosterCard'
import { NavigationContext } from '@/contexts/NavigationContext'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'

const card = (title: string, mediaType: string) => ({
  mediaId: 7, mediaType, title, overview: '', releaseDate: '', voteAverage: 0, posterPath: '', backdropPath: ''
})

function renderCards() {
  return render(
    <NavigationContext.Provider value={{ pathname: '/movies', push: () => {} }}>
      <ToWatchListProvider>
        <Header />
        <PosterCard src="/404.png" info={card('Movie', 'movie')} />
        <PosterCard src="/404.png" info={card('Series', 'tv')} />
      </ToWatchListProvider>
    </NavigationContext.Provider>
  )
}

beforeEach(() => {
  localStorage.clear()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
  Cookies.remove('ToWatchList')
  Cookies.remove('itemsId')
})

it('migrates legacy cookies once without changing them', () => {
  const legacy = JSON.stringify([{ mediaId: 7, mediaType: 'movie', title: 'Movie', poster_path: '/legacy.jpg' }])
  const ids = JSON.stringify([7])
  Cookies.set('ToWatchList', legacy)
  Cookies.set('itemsId', ids)
  renderCards()
  expect(screen.getByRole('button', { name: 'Remove Movie from watchlist' })).toHaveAttribute('aria-pressed', 'true')
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items[0]).toMatchObject({ posterPath: '/legacy.jpg' })
  expect(Cookies.get('ToWatchList')).toBe(legacy)
  expect(Cookies.get('itemsId')).toBe(ids)
})

it('saves and removes movie and series with the same ID independently', () => {
  renderCards()
  fireEvent.click(screen.getByRole('button', { name: 'Add Movie to watchlist' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add Series to watchlist' }))
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items).toMatchObject([
    { mediaId: 7, mediaType: 'movie' }, { mediaId: 7, mediaType: 'tv' }
  ])
  fireEvent.click(screen.getByRole('button', { name: 'Remove Movie from watchlist' }))
  expect(screen.getByRole('button', { name: 'Remove Series from watchlist' })).toHaveAttribute('aria-pressed', 'true')
  expect(JSON.parse(localStorage.getItem(watchlistConfig.storageKey)!).items).toMatchObject([{ mediaId: 7, mediaType: 'tv' }])
})

it('blocks changes and retains malformed legacy data with a visible warning', () => {
  Cookies.set('ToWatchList', '{broken')
  renderCards()
  expect(screen.getByRole('alert')).toHaveTextContent('existing data has not been changed')
  expect(screen.getByRole('button', { name: 'Add Movie to watchlist' })).toBeDisabled()
  expect(Cookies.get('ToWatchList')).toBe('{broken')
  expect(localStorage.getItem(watchlistConfig.storageKey)).toBeNull()
})

it('warns when storage writes fail instead of silently claiming persistence', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  renderCards()
  fireEvent.click(screen.getByRole('button', { name: 'Add Movie to watchlist' }))
  expect(screen.getByRole('button', { name: 'Remove Movie from watchlist' })).toBeInTheDocument()
  expect(screen.getByRole('alert')).toHaveTextContent('Changes may be lost')
  expect(localStorage.getItem(watchlistConfig.storageKey)).toBeNull()
})

it('updates from another tab without overwriting its changes', () => {
  renderCards()
  fireEvent.click(screen.getByRole('button', { name: 'Add Movie to watchlist' }))
  const next = JSON.stringify({ version: 1, items: [card('Series', 'tv')] })
  localStorage.setItem(watchlistConfig.storageKey, next)
  fireEvent(window, new StorageEvent('storage', { key: watchlistConfig.storageKey, newValue: next, storageArea: localStorage }))
  expect(screen.getByRole('button', { name: 'Add Movie to watchlist' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Remove Series from watchlist' })).toBeInTheDocument()
  expect(localStorage.getItem(watchlistConfig.storageKey)).toBe(next)
})

it('does not overwrite a newer snapshot when a tab missed the storage event', () => {
  renderCards()
  const newer = JSON.stringify({ version: 1, items: [card('Series', 'tv')] })
  localStorage.setItem(watchlistConfig.storageKey, newer)
  fireEvent.click(screen.getByRole('button', { name: 'Add Movie to watchlist' }))
  expect(screen.getByRole('alert')).toHaveTextContent('changed in another tab')
  expect(screen.getByRole('button', { name: 'Remove Movie from watchlist' })).toBeDisabled()
  expect(localStorage.getItem(watchlistConfig.storageKey)).toBe(newer)
})
