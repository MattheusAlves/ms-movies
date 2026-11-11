import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import Cookies from 'js-cookie'

import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { MediaSummary } from '@/util/media'
import { watchlistConfig } from '@/config/watchlist'
import { loadWatchlist, parseStoredWatchlist, saveWatchlist, storageConflictWarning, storageUnavailableWarning, WatchlistConflictError, WatchlistLoadResult } from '@/util/watchlistStorage'

interface ToWatchListContextData {
  toWatchList: Array<MediaSummary> | null
  canEdit: boolean
  storageWarning: string | null
  isWatchItemSaved: (item: MediaSummary) => boolean
  toggleWatchItem: (item: MediaSummary) => void
}
interface ToWatchListContextProps {
  children: React.ReactNode
}

export const ToWatchListContext = createContext({} as ToWatchListContextData)

export function ToWatchListProvider({
  children
}: ToWatchListContextProps): React.JSX.Element {
  const [state, setState] = useState<(WatchlistLoadResult & { dirty: boolean }) | null>(null)
  const { contentType } = useContext(ContentTypeContext)
  const toWatchList = state?.items ?? null

  const resolveType = (item: MediaSummary) => item.mediaType ||
    (contentType === 'movies' ? 'movie' : contentType === 'series' ? 'tv' : '')

  const isWatchItemSaved = (item: MediaSummary): boolean => {
    const type = resolveType(item)
    return !!type && !!toWatchList?.some(saved => saved.mediaId === item.mediaId && saved.mediaType === type)
  }

  const toggleWatchItem = (item: MediaSummary): void => {
    const mediaType = resolveType(item)
    if (!mediaType || !Number.isSafeInteger(item.mediaId) || item.mediaId <= 0) return
    const newItem = { ...item, mediaType }
    setState(current => {
      if (!current || current.readOnly) return current
      const matches = (saved: MediaSummary) => saved.mediaId === newItem.mediaId && saved.mediaType === mediaType
      const items = current.items.some(matches)
        ? current.items.filter(saved => !matches(saved))
        : [...current.items, newItem]
      return { ...current, items, dirty: true }
    })
  }

  useEffect(() => {
    if (!state || !state.dirty || state.readOnly) return
    let warning: string | null = null
    let snapshot = state.snapshot
    let readOnly = false
    try {
      snapshot = saveWatchlist(window.localStorage, state.items, state.snapshot)
    } catch (error) {
      readOnly = error instanceof WatchlistConflictError
      warning = readOnly ? storageConflictWarning() : storageUnavailableWarning()
    }
    // Only mark this revision saved; a newer change must still be persisted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(current => current?.items === state.items ? { ...current, dirty: false, warning, snapshot, readOnly } : current)
  }, [state])

  useEffect(() => {
    let storage: Storage | null = null
    try { storage = window.localStorage } catch { /* Private mode can deny access. */ }
    let loaded: WatchlistLoadResult
    try {
      loaded = loadWatchlist(storage, Cookies.get('ToWatchList'), Cookies.get('itemsId'))
    } catch {
      loaded = { items: [], readOnly: true, warning: 'Your saved watchlist could not be read safely. Your existing data has not been changed; do not clear browser data.', snapshot: null }
    }
    // Read after hydration so server and browser initially render the same UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ...loaded, dirty: false })
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== watchlistConfig.storageKey && event.key !== null) return
      try {
        if (event.storageArea && event.storageArea !== window.localStorage) return
      } catch { return }
      const items = event.newValue === null ? null : parseStoredWatchlist(event.newValue)
      setState(current => {
        if (!current) return current
        if (current.dirty || !items || event.newValue === null) {
          return { ...current, readOnly: true, dirty: false, warning: storageConflictWarning() }
        }
        return { items, snapshot: event.newValue, readOnly: false, dirty: false, warning: null }
      })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <ToWatchListContext.Provider
      value={{ toWatchList, toggleWatchItem, isWatchItemSaved, canEdit: !!state && !state.readOnly, storageWarning: state?.warning ?? null }}
    >
      {children}
    </ToWatchListContext.Provider>
  )
}
