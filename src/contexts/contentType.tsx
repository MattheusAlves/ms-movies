import { createContext, useState, useContext } from 'react'

interface ContentTypeContextData {
  type: string
  toggleContentType(): void
}
const ContentTypeContext = createContext<ContentTypeContextData>(
  {} as ContentTypeContextData
)

export const ContentTypeProvider: React.FC = ({ children }) => {
  const [contentType, setContentType] = useState('movie')
  function toggleContentType() {
    setContentType(contentType === 'movie' ? 'tv' : 'movie')
  }
  return (
    <ContentTypeContext.Provider
      value={{ type: contentType, toggleContentType }}
    >
      {children}
    </ContentTypeContext.Provider>
  )
}

export function useContentType(): ContentTypeContextData {
  const context = useContext(ContentTypeContext)
  return context
}
