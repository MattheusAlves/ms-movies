import React, { createContext, useContext, useState } from 'react'

interface ContentTypeContextData {
  contentType: string
  changeContentType: (string) => void
  loading: boolean
  toggleLoading: () => void
}
interface ContentTypeProviderProps {
  children: React.ReactNode
}
export const ContentTypeContext = createContext({} as ContentTypeContextData)

export function ContentTypeProvider({
  children
}: ContentTypeProviderProps): JSX.Element {
  const [contentType, setContentType] = useState('movies')
  const [loading, setLoading] = useState(false)

  const changeContentType = (contentType: string) => {
    setContentType(contentType)
  }
  const toggleLoading = () => setLoading(!loading)
  return (
    <ContentTypeContext.Provider
      value={{ contentType, changeContentType, loading, toggleLoading }}
    >
      {children}
    </ContentTypeContext.Provider>
  )
}
