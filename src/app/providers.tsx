'use client'

import { AppNavigationProvider } from '@/contexts/AppNavigationProvider'
import { ContentTypeProvider } from '@/contexts/ContentTypeContext'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'
import { DetailModalProvider } from '@/components/DetailModal'
import NavigationProgress from './NavigationProgress'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppNavigationProvider>
      <NavigationProgress />
      <ContentTypeProvider>
        <ToWatchListProvider>
          <DetailModalProvider>{children}</DetailModalProvider>
        </ToWatchListProvider>
      </ContentTypeProvider>
    </AppNavigationProvider>
  )
}
