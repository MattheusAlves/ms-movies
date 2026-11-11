import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/router', () => ({
  useRouter: () => ({ push, query: {} })
}))

import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'

afterEach(() => {
  cleanup()
  push.mockReset()
})

const renderSearch = (changeContentType = vi.fn()) => {
  const wrapper = ({ children }) => (
    <ContentTypeContext.Provider
      value={{ contentType: 'movies', changeContentType }}
    >
      {children}
    </ContentTypeContext.Provider>
  )
  return { changeContentType, ...render(<Search rightNav={false} />, { wrapper }) }
}

describe('Search', () => {
  it('encodes the trimmed query and clears the content type on submit', () => {
    const { container, changeContentType } = renderSearch()
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: '  Space & Time / 2026  ' }
    })
    fireEvent.submit(container.querySelector('form'))
    expect(push).toHaveBeenCalledWith('/search/Space%20%26%20Time%20%2F%202026')
    expect(changeContentType).toHaveBeenCalledWith('')
  })

  it('does not navigate with an empty query', () => {
    const { container } = renderSearch()
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: '   ' }
    })
    fireEvent.submit(container.querySelector('form'))
    expect(push).not.toHaveBeenCalled()
  })
})
