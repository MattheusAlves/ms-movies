import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const { start, done } = vi.hoisted(() => ({ start: vi.fn(), done: vi.fn() }))
vi.mock('nprogress', () => ({ default: { start, done } }))
vi.mock('next/navigation', () => ({ usePathname: () => '/movies' }))

import NavigationProgress from '@/app/NavigationProgress'
import { startNavigationProgress } from '@/util/navigationProgress'

beforeEach(() => {
  vi.useFakeTimers()
  start.mockReset()
  done.mockReset()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('starts for internal navigation and stops when unmounted', () => {
  const { getByText, unmount } = render(<><NavigationProgress /><a href="/series">Series</a></>)
  fireEvent.click(getByText('Series'), { button: 0 })
  expect(start).toHaveBeenCalledOnce()
  unmount()
  expect(done).toHaveBeenCalled()
})

it('finishes cancelled navigation after the fallback timeout', () => {
  startNavigationProgress()
  expect(start).toHaveBeenCalledOnce()
  vi.advanceTimersByTime(15000)
  expect(done).toHaveBeenCalledOnce()
})

it('does not start for external or query-only links', () => {
  const { getByText } = render(
    <>
      <NavigationProgress />
      <a href="?page=2" onClick={event => event.preventDefault()}>Query</a>
      <a href="https://example.com" onClick={event => event.preventDefault()}>External</a>
    </>
  )
  fireEvent.click(getByText('Query'), { button: 0 })
  fireEvent.click(getByText('External'), { button: 0 })
  expect(start).not.toHaveBeenCalled()
})
