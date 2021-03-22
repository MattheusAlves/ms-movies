import React, { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
interface ContentTypeContextData {
  contentType: string
  changeContentType: (string) => void
}
interface ContentTypeProviderProps {
  children: React.ReactNode
}
export const ContentTypeContext = createContext({} as ContentTypeContextData)

export function ContentTypeProvider({
  children
}: ContentTypeProviderProps): JSX.Element {
  const [contentType, setContentType] = useState('')
  const router = useRouter()
  useEffect(() => {
    setContentType(String(router.query.type))
  }, [])

  const changeContentType = (newContentType: string) => {
    setContentType(newContentType)
  }
  return (
    <ContentTypeContext.Provider value={{ contentType, changeContentType }}>
      {children}
    </ContentTypeContext.Provider>
  )
}
