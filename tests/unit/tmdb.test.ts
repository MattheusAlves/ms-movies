// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { axiosGet } = vi.hoisted(() => ({ axiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: axiosGet } }))

import { tmdbGet } from '@/util/tmdb'

describe('tmdbGet', () => {
  beforeEach(() => {
    axiosGet.mockReset()
    vi.stubEnv('API_KEY', 'test-key')
  })

  it('requests the TMDB path with the server key and extra params', async () => {
    axiosGet.mockResolvedValue({ data: { page: 1 } })
    const data = await tmdbGet('3/discover/movie', { page: 7 })
    expect(data).toEqual({ page: 1 })
    expect(axiosGet).toHaveBeenCalledWith('https://api.themoviedb.org/3/discover/movie', {
      params: { api_key: 'test-key', page: 7 }
    })
  })

  it('merges params without letting them override the API key', async () => {
    axiosGet.mockResolvedValue({ data: {} })
    await tmdbGet('3/movie/1', { api_key: 'spoofed' })
    expect(axiosGet.mock.calls[0][1].params.api_key).toBe('test-key')
  })
})
