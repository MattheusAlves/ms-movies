import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/router', () => ({ useRouter: () => ({ query: { type: 'movies' } }) }))

import Header from '@/components/shared/Header'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'

afterEach(cleanup)

const renderHeader = () =>
  render(
    <ContentTypeContext.Provider
      value={{ contentType: 'movies', changeContentType: () => {} }}
    >
      <Header />
    </ContentTypeContext.Provider>
  )

const setScrollY = value => {
  Object.defineProperty(window, 'scrollY', { value, configurable: true })
  fireEvent.scroll(window)
}

describe('Header', () => {
  it('renders the navigation links with the active content type', () => {
    renderHeader()
    expect(screen.getByText('Filmes').className).toBe('currentLink')
    expect(screen.getByText('Séries').className).toBe('')
  })

  it('turns the bar opaque after scrolling past the threshold', () => {
    const { container } = renderHeader()
    const nav = container.querySelector('.nav-bar')
    expect(nav.className).toContain('transparent')

    setScrollY(50)
    expect(nav.className).not.toContain('transparent')

    setScrollY(5)
    expect(nav.className).toContain('transparent')
  })

  it('stops listening to scroll events after unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHeader()
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('toggles the mobile menu with the burger button', () => {
    const { container } = renderHeader()
    const burger = container.querySelector('.burger')
    const links = container.querySelector('.nav-links')
    expect(links.className).toBe('nav-links')

    fireEvent.click(burger)
    expect(links.className).toBe('nav-links nav-active')
    expect(container.querySelector('.burger-line1').className).toBe('toggle burger-line1')

    fireEvent.click(burger)
    expect(links.className).toBe('nav-links')
  })
})
