// Preloaded only by the fixture build/smoke scripts; application code never
// enables this mock. No real provider credentials or network calls are needed.
const nock = require('nock')

const movie = {
  id: 101, media_type: 'movie', title: 'Fixture Movie', overview: 'A fixture movie.',
  poster_path: '/fixture.jpg', release_date: '2020-01-01', vote_average: 7.5
}
const series = {
  id: 202, media_type: 'tv', name: 'Fixture Series', overview: 'A fixture series.',
  poster_path: '/fixture-series.jpg', first_air_date: '2021-01-01', vote_average: 8
}

nock('https://api.themoviedb.org')
  .persist()
  .get(/.*/)
  .query(true)
  .reply(uri => {
    const pathname = new URL(uri, 'https://api.themoviedb.org').pathname
    if (pathname.includes('/credits')) return [200, { cast: [] }]
    if (pathname.includes('/videos')) return [200, { results: [] }]
    if (pathname.includes('/watch/providers')) return [200, { results: {} }]
    if (pathname.startsWith('/3/movie/')) return [200, { ...movie, genres: [] }]
    if (pathname.startsWith('/3/tv/')) return [200, { ...series, genres: [] }]
    if (pathname.includes('/search/multi')) return [200, { results: [movie, series] }]
    if (pathname === '/3/discover/movie') return [200, { results: [movie] }]
    if (pathname === '/3/discover/tv') return [200, { results: [series] }]
    return [404, { message: 'Unexpected TMDB fixture request' }]
  })
