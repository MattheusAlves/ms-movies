'use client'

import { usePathname, useRouter } from 'next/navigation'
import { NavigationContext } from '@/contexts/NavigationContext'
import { startNavigationProgress } from '@/util/navigationProgress'

export function AppNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
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
