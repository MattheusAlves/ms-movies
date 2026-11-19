// Preloaded only by the fixture build/smoke scripts; application code never
// enables this mock. No real provider credentials or network calls are needed.
const nock = require('nock')

const movie = {
  id: 101, title: 'Fixture Movie', overview: 'A fixture movie.',
  poster_path: '/fixture.jpg', release_date: '2020-01-01', vote_average: 7.5
}
const series = {
  id: 202, name: 'Fixture Series', overview: 'A fixture series.',
  poster_path: '/fixture-series.jpg', first_air_date: '2021-01-01', vote_average: 8
}
const cast = [
  { id: 303, known_for_department: 'Acting', profile_path: '/fixture-actor.jpg', name: 'Fixture Actor', original_name: 'Fixture Actor', character: 'Fixture Character' }
]

nock('https://api.themoviedb.org')
  .persist()
  .get(/.*/)
  .query(true)
  .reply(uri => {
    const url = new URL(uri, 'https://api.themoviedb.org')
    const pathname = url.pathname
    if (pathname === '/3/search/multi' && url.searchParams.get('query') === 'offline-fixture') return [503, { message: 'Fixture outage' }]
    if (pathname === '/3/search/multi' && url.searchParams.get('query') === 'nothing-fixture') return [200, { results: [] }]
    if (pathname === '/3/movie/999') return [503, { message: 'Fixture outage' }]
    if (pathname === '/3/movie/998') return [200, { ...movie, id: 998, poster_path: null, genres: [] }]
    if (pathname.includes('/credits')) return [200, { cast }]
    if (pathname.includes('/videos')) return [200, { results: [{ key: 'fixture-video', site: 'YouTube', type: 'Trailer' }] }]
    if (pathname.includes('/watch/providers')) return [200, { results: { BR: { flatrate: [{ provider_name: 'Fixture Stream' }] } } }]
    if (pathname.startsWith('/3/movie/')) return [200, { ...movie, genres: [] }]
    if (pathname.startsWith('/3/tv/')) return [200, { ...series, genres: [] }]
    if (pathname === '/3/search/multi') {
      const page = Number(url.searchParams.get('page') || 1)
      return [200, { page, total_pages: 2, results: page === 1
        ? [{ ...movie, media_type: 'movie' }, { ...series, media_type: 'tv' }]
        : [{ ...movie, id: 103, title: 'Another Fixture Movie', media_type: 'movie' }] }]
    }
    if (pathname === '/3/discover/movie') {
      const page = Number(url.searchParams.get('page') || 1)
      return [200, { page, total_pages: 2, results: page === 1 ? [movie] : page === 2 ? [{ ...movie, id: 102, title: 'Fixture Movie Two' }] : [] }]
    }
    if (pathname === '/3/discover/tv') {
      const page = Number(url.searchParams.get('page') || 1)
      return [200, { page, total_pages: 2, results: page === 1 ? [series] : page === 2 ? [{ ...series, id: 203, name: 'Fixture Series Two' }] : [] }]
    }
    return [404, { message: 'Unexpected TMDB fixture request' }]
  })
