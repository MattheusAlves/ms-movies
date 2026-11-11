import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { useContext } from 'react'

import { ContentTypeContext, ContentTypeProvider } from '@/contexts/ContentTypeContext'
import { NavigationContext } from '@/contexts/NavigationContext'

afterEach(cleanup)

it('derives content type from the current route across navigation and Back', () => {
  function CurrentType() {
    const { contentType } = useContext(ContentTypeContext)
    return <span>{contentType || 'none'}</span>
  }
  const page = (pathname: string) => (
    <NavigationContext.Provider value={{ pathname, push: () => {} }}>
      <ContentTypeProvider><CurrentType /></ContentTypeProvider>
    </NavigationContext.Provider>
  )
  const { rerender } = render(page('/movies'))
  expect(screen.getByText('movies')).toBeInTheDocument()
  rerender(page('/search/fixture'))
  expect(screen.getByText('none')).toBeInTheDocument()
  rerender(page('/movies'))
  expect(screen.getByText('movies')).toBeInTheDocument()
  rerender(page('/series'))
  expect(screen.getByText('series')).toBeInTheDocument()
})
