import { createContext, useState, useContext, useEffect } from 'react'
import Cookies from 'js-cookie'

import { ContentTypeContext } from '@/contexts/ContentTypeContext'

interface ToWatchListContextData {
  ToWatchList: Array<ToWatchList>
  itemsId: Array<number>
  addToList: (data: ToWatchList) => void
}
interface ToWatchListContextProps {
  children: React.ReactNode
}
interface ToWatchList {
  mediaId: number
  title: string
  overview: string
  mediaType: string
  ['release_date']: string
  src: string
}

export const ToWatchListContext = createContext({} as ToWatchListContextData)

export function ToWatchListProvider({
  children
}: ToWatchListContextProps): JSX.Element {
  const [ToWatchList, setToWatchList] = useState<Array<ToWatchList>>(null)
  const [itemsId, setItemsId] = useState<Array<number>>(null)
  const { contentType } = useContext(ContentTypeContext)

  const addToList = data => {
    console.log('data', data)
    if (!data.mediaType) {
      data.mediaType = contentType === 'movies' ? 'movie' : 'tv'
    }
    if (itemsId && itemsId.includes(data.mediaId)) {
      deleteFromList(data)
    } else {
      ToWatchList
        ? setToWatchList([...ToWatchList, { ...data }])
        : setToWatchList([{ ...data }])
      itemsId
        ? setItemsId([...itemsId, data.mediaId])
        : setItemsId([data.mediaId])
    }
  }
  const deleteFromList = data => {
    const newItemsId = itemsId.filter(item => item !== data.mediaId)
    const newToWatchList = ToWatchList.filter(
      item => item.mediaId !== data.mediaId
    )
    setItemsId(newItemsId)
    setToWatchList(newToWatchList)
  }
  useEffect(() => {
    if (itemsId) Cookies.set('itemsId', itemsId)
  }, [itemsId])
  useEffect(() => {
    console.log(ToWatchList)
    if (ToWatchList) Cookies.set('ToWatchList', ToWatchList)
  }, [ToWatchList])
  useEffect(() => {
    const jsonItems = Cookies.get('itemsId')
    const jsonToWatchList = Cookies.get('ToWatchList')
    if (jsonItems) {
      const items = JSON.parse(Cookies.get('itemsId'))
      setItemsId(items)
    }
    if (jsonToWatchList) {
      const ToWatchListData = JSON.parse(Cookies.get('ToWatchList'))
      setToWatchList(ToWatchListData)
    }
  }, [])
  return (
    <ToWatchListContext.Provider value={{ ToWatchList, addToList, itemsId }}>
      {children}
    </ToWatchListContext.Provider>
  )
}
