const { configuredBaseUrl } = require('./src/config/base-url.cjs')

// Validate configuration at startup; public values are embedded at build time.
configuredBaseUrl(process.env.TMDB_API_BASE_URL, 'TMDB_API_BASE_URL')
configuredBaseUrl(process.env.IMDB_API_BASE_URL, 'IMDB_API_BASE_URL')
configuredBaseUrl(process.env.NEXT_PUBLIC_YOUTUBE_EMBED_BASE_URL, 'NEXT_PUBLIC_YOUTUBE_EMBED_BASE_URL')
const imageBase = new URL(configuredBaseUrl(process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL, 'NEXT_PUBLIC_TMDB_IMAGE_BASE_URL'))

module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: imageBase.hostname, port: imageBase.port, pathname: `${imageBase.pathname.replace(/\/$/, '')}/**` }
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
