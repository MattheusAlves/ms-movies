import React, { createContext } from 'react'
import { useNavigation } from '@/contexts/NavigationContext'
interface ContentTypeContextData {
  contentType: string
}
interface ContentTypeProviderProps {
  children: React.ReactNode
}
export const ContentTypeContext = createContext<ContentTypeContextData>({ contentType: '' })

export function ContentTypeProvider({
  children
}: ContentTypeProviderProps): React.JSX.Element {
  const { pathname } = useNavigation()
  const contentType = pathname === '/movies' ? 'movies' : pathname === '/series' ? 'series' : ''
  return (
    <ContentTypeContext.Provider value={{ contentType }}>
      {children}
    </ContentTypeContext.Provider>
  )
}
