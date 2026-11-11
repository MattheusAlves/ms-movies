module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/movies',
        permanent: true
      }
    ]
  }
}
