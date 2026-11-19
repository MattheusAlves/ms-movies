import { useRouter } from 'next/router'
import { NavigationContext } from '@/contexts/NavigationContext'

export function PagesNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <NavigationContext.Provider value={{ pathname: router.asPath?.split('?')[0] || '', push: url => { void router.push(url) } }}>
      {children}
    </NavigationContext.Provider>
  )
}
