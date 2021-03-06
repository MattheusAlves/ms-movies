import React, { createContext, useState } from 'react'

interface HeaderContextsData {
  transparent: boolean
  toggleTransparency: (boolean) => void
}
interface HeaderContextProps {
  children: React.ReactNode
}

export const HeaderContext = createContext({} as HeaderContextsData)

export function HeaderContextProvider({
  children
}: HeaderContextProps): JSX.Element {
  const [transparent, setTransparent] = useState(true)
  const toggleTransparency = (value: boolean) => {
    setTransparent(value)
  }
  return (
    <HeaderContext.Provider value={{ transparent, toggleTransparency }}>
      {children}
    </HeaderContext.Provider>
  )
}
