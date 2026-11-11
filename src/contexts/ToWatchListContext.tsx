import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import Cookies from 'js-cookie'

import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { MediaSummary } from '@/util/media'

interface ToWatchListContextData {
  toWatchList: Array<MediaSummary> | null
  itemsId: Array<number>
  toggleWatchItem: (item: MediaSummary) => void
}
interface ToWatchListContextProps {
  children: React.ReactNode
}

export const ToWatchListContext = createContext({} as ToWatchListContextData)

export function ToWatchListProvider({
  children
}: ToWatchListContextProps): React.JSX.Element {
  const [toWatchList, setToWatchList] = useState<Array<MediaSummary> | null>(
    null
  )
  const { contentType } = useContext(ContentTypeContext)

  // Derived from the list so the two can never fall out of sync.
  const itemsId = useMemo(
    () => (toWatchList ?? []).map(item => item.mediaId),
    [toWatchList]
  )

  const toggleWatchItem = (item: MediaSummary): void => {
    const newItem: MediaSummary = item.mediaType
      ? item
      : { ...item, mediaType: contentType === 'movies' ? 'movie' : 'tv' }
    setToWatchList(list => {
      const current = list ?? []
      return current.some(saved => saved.mediaId === newItem.mediaId)
        ? current.filter(saved => saved.mediaId !== newItem.mediaId)
        : [...current, { ...newItem }]
    })
  }

  // Both cookies keep being written so a rolled-back version still finds its data.
  useEffect(() => {
    if (!toWatchList) return
    Cookies.set('ToWatchList', JSON.stringify(toWatchList))
    Cookies.set('itemsId', JSON.stringify(itemsId))
  }, [toWatchList, itemsId])

  useEffect(() => {
    const savedList = Cookies.get('ToWatchList')
    // Read after hydration so server and browser initially render the same UI.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedList) setToWatchList(JSON.parse(savedList))
  }, [])

  return (
    <ToWatchListContext.Provider
      value={{ toWatchList, toggleWatchItem, itemsId }}
    >
      {children}
    </ToWatchListContext.Provider>
  )
}
