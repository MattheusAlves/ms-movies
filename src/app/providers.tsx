'use client'

import { AppNavigationProvider } from '@/contexts/AppNavigationProvider'
import { ContentTypeProvider } from '@/contexts/ContentTypeContext'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'
import NavigationProgress from './NavigationProgress'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppNavigationProvider>
      <NavigationProgress />
      <ContentTypeProvider>
        <ToWatchListProvider>{children}</ToWatchListProvider>
      </ContentTypeProvider>
    </AppNavigationProvider>
  )
}
