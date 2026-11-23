'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { startNavigationProgress, stopNavigationProgress } from '@/util/navigationProgress'

export default function NavigationProgress() {
  const pathname = usePathname()
  useEffect(() => {
    stopNavigationProgress()
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      if (!link || link.target || link.hasAttribute('download')) return
      const destination = new URL(link.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      // Pathname is the completion signal; query/hash-only links do not change it.
      if (destination.pathname === window.location.pathname) return
      startNavigationProgress()
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      stopNavigationProgress()
    }
  }, [])
  return null
}
