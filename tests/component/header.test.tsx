import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Header from '@/components/shared/Header'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { NavigationContext } from '@/contexts/NavigationContext'

afterEach(cleanup)

const renderHeader = () => render(
  <NavigationContext.Provider value={{ pathname: '/movies', push: () => {} }}>
    <ContentTypeContext.Provider value={{ contentType: 'movies' }}>
      <Header />
    </ContentTypeContext.Provider>
  </NavigationContext.Provider>
)

describe('Header', () => {
  it('renders semantic navigation and identifies the current page', () => {
    renderHeader()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Movies' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Series' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('searchbox', { name: 'Search movies and series' })).toBeInTheDocument()
  })

  it('toggles the mobile menu with an accessible button', () => {
    const { container } = renderHeader()
    const button = screen.getByRole('button', { name: 'Toggle navigation' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('#primary-menu')).toHaveClass('nav-panel--open')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('transitions from transparent to opaque after scrolling', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('site-header--transparent')
    Object.defineProperty(window, 'scrollY', { value: 30, configurable: true })
    fireEvent.scroll(window)
    expect(header).not.toHaveClass('site-header--transparent')
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    fireEvent.scroll(window)
    expect(header).toHaveClass('site-header--transparent')
  })
})
