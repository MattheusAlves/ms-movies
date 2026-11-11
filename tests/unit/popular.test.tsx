import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const { useSWRInfinite } = vi.hoisted(() => ({ useSWRInfinite: vi.fn() }))
vi.mock('swr/infinite', () => ({ default: useSWRInfinite }))

const { fetcher } = vi.hoisted(() => ({ fetcher: vi.fn() }))
vi.mock('@/util/fetcher', () => ({ default: fetcher }))

import { useGetPopular } from '@/actions/popular'

describe('useGetPopular', () => {
  it('builds per-page SWR keys for each resource and forwards SWR state', () => {
    const resources = [
      ['movies', '/api/movies/popular'],
      ['series', '/api/series/popular']
    ] as const
    for (const [resource, path] of resources) {
      const initialData = [{ results: [{ id: 1 }] }]
      const setSize = async () => {}
      useSWRInfinite.mockReturnValue({
        data: initialData,
        error: undefined,
        size: 4,
        setSize,
        isValidating: true
      })
      const { result } = renderHook(() => useGetPopular(resource, { initialData }))

      const getKey = useSWRInfinite.mock.calls.at(-1)![0]
      expect(getKey(0)).toBe(`${path}?page=1`)
      expect(getKey(3)).toBe(`${path}?page=4`)
      expect(getKey(6)).toBe(`${path}?page=7`)
      expect(useSWRInfinite.mock.calls.at(-1)![1]).toBe(fetcher)
      expect(useSWRInfinite.mock.calls.at(-1)![2]).toEqual({
        initialSize: 4,
        fallbackData: initialData,
        persistSize: false
      })
      expect(result.current.data).toBe(initialData)
      expect(result.current.loading).toBe(false)
      expect(result.current.setSize).toBe(setSize)
      expect(result.current.isValidating).toBe(true)
    }
  })

  it('reports loading until data or error arrives', () => {
    useSWRInfinite.mockReturnValue({ data: undefined, error: undefined })
    const loading = renderHook(() => useGetPopular('movies', { initialData: null }))
    expect(loading.result.current.loading).toBe(true)

    const error = new Error('failed')
    useSWRInfinite.mockReturnValue({ data: undefined, error })
    const failed = renderHook(() => useGetPopular('movies', { initialData: null }))
    expect(failed.result.current.loading).toBe(false)
    expect(failed.result.current.error).toBe(error)
  })
})
