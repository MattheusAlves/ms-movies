import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/router', () => ({
  useRouter: () => ({ push, query: {} })
}))

import Search from '@/components/shared/Search'
import { NavigationContext } from '@/contexts/NavigationContext'

afterEach(() => {
  cleanup()
  push.mockReset()
})

const renderSearch = () => {
  const wrapper = ({ children }) => (
    <NavigationContext.Provider value={{ pathname: '/movies', push }}>
      {children}
    </NavigationContext.Provider>
  )
  return render(<Search />, { wrapper })
}

describe('Search', () => {
  it('encodes the trimmed query on submit', () => {
    const { container } = renderSearch()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search movies and series' }), {
      target: { value: '  Space & Time / 2026  ' }
    })
    fireEvent.submit(container.querySelector('form')!)
    expect(push).toHaveBeenCalledWith('/search/Space%20%26%20Time%20%2F%202026')
  })

  it('does not navigate with an empty query', () => {
    const { container } = renderSearch()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search movies and series' }), {
      target: { value: '   ' }
    })
    fireEvent.submit(container.querySelector('form')!)
    expect(push).not.toHaveBeenCalled()
  })
})
