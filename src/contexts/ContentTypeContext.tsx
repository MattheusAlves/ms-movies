import React, { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
interface ContentTypeContextData {
  contentType: string
  changeContentType: (string) => void
  loading: boolean
  toggleLoading: (boolean) => void
}
interface ContentTypeProviderProps {
  children: React.ReactNode
}
export const ContentTypeContext = createContext({} as ContentTypeContextData)

export function ContentTypeProvider({
  children
}: ContentTypeProviderProps): JSX.Element {
  const [contentType, setContentType] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  useEffect(() => {
    setContentType(String(router.query.type))
  }, [])

  const changeContentType = (newContentType: string) => {
    setContentType(newContentType)
    if (newContentType !== '' && newContentType !== contentType) {
      setLoading(true)
    }
  }
  const toggleLoading = (value: boolean) => setLoading(value)
  return (
    <ContentTypeContext.Provider
      value={{ contentType, changeContentType, loading, toggleLoading }}
    >
      {children}
    </ContentTypeContext.Provider>
  )
}
