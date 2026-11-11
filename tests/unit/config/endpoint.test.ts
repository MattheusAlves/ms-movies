// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { endpoint } from '@/config/endpoint'

describe('endpoint configuration', () => {
  it('builds the existing application API routes', () => {
    expect(endpoint.api.popular('movies', 2)).toBe('/api/movies/popular?page=2')
    expect(endpoint.api.popular('series', 3)).toBe('/api/series/popular?page=3')
    expect(endpoint.api.cast('movie', 101)).toBe('/api/cast/movie/101')
    expect(endpoint.api.trailer('tv', 202)).toBe('/api/info/trailer/tv/202')
    expect(endpoint.api.watchProviders('movie', 101)).toBe('/api/info/watchproviders/movie/101')
    expect(endpoint.api.category('movies')).toBe('/api/movies/by/category')
    expect(endpoint.api.category('series')).toBe('/api/series/by/category')
  })

  it('builds TMDB request paths and URLs', () => {
    expect(endpoint.tmdb.url(endpoint.tmdb.discover('movie'))).toBe('https://api.themoviedb.org/3/discover/movie')
    expect(endpoint.tmdb.url(endpoint.tmdb.discover('tv'))).toBe('https://api.themoviedb.org/3/discover/tv')
    expect(endpoint.tmdb.url(endpoint.tmdb.search)).toBe('https://api.themoviedb.org/3/search/multi')
    expect(endpoint.tmdb.url(endpoint.tmdb.detail('movie', 101))).toBe('https://api.themoviedb.org/3/movie/101')
    expect(endpoint.tmdb.url(endpoint.tmdb.credits('movie', 101))).toBe('https://api.themoviedb.org/3/movie/101/credits')
    expect(endpoint.tmdb.url(endpoint.tmdb.videos('tv', 202))).toBe('https://api.themoviedb.org/3/tv/202/videos')
    expect(endpoint.tmdb.url(endpoint.tmdb.watchProviders('tv', 202))).toBe('https://api.themoviedb.org/3/tv/202/watch/providers')
    expect(endpoint.tmdb.image(300, '/poster.jpg')).toBe('https://image.tmdb.org/t/p/w300/poster.jpg')
  })

  it('defines the IMDb and YouTube endpoints without credentials', () => {
    expect(endpoint.imdb.host).toBe('imdb8.p.rapidapi.com')
    expect(endpoint.imdb.overview).toBe('https://imdb8.p.rapidapi.com/title/get-overview-details')
    expect(endpoint.youtube.embed('video-id')).toBe('https://www.youtube.com/embed/video-id')
  })
})
