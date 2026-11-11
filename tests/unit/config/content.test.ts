// @vitest-environment node
import { expect, it } from 'vitest'
import { contentConfig } from '@/config/content'

it('keeps the shared content preferences in one configuration', () => {
  expect(contentConfig).toEqual({
    language: 'en-US',
    discoverySort: 'popularity.desc',
    watchRegion: 'BR',
    watchRegionName: 'Brazil'
  })
})
