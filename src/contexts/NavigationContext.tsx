'use client'

import { createContext, useContext } from 'react'
import { useRouter as usePagesRouter } from 'next/router'
import { usePathname, useRouter as useAppRouter } from 'next/navigation'
import { startNavigationProgress } from '@/util/navigationProgress'

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

export function PagesNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = usePagesRouter()
  return (
    <NavigationContext.Provider value={{ pathname: router.asPath?.split('?')[0] || '', push: url => { void router.push(url) } }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useAppRouter()
  const pathname = usePathname()
  return (
    <NavigationContext.Provider value={{
      pathname: pathname || '',
      push: url => {
        if (url.split(/[?#]/)[0] !== pathname) startNavigationProgress()
        router.push(url)
      }
    }}>
      {children}
    </NavigationContext.Provider>
  )
}
