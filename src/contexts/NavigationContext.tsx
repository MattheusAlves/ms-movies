'use client'

import { createContext, useContext } from 'react'

interface Navigation {
  pathname: string
  push: (url: string) => void
}

export const NavigationContext = createContext<Navigation | null>(null)

export function useNavigation() {
  const navigation = useContext(NavigationContext)
  if (!navigation) throw new Error('A navigation provider is required')
  return navigation
}
