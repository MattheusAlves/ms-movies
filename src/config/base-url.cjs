// External base URLs are configuration, never a place for credentials.
function configuredBaseUrl(value, name) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`Invalid ${name}: expected an HTTPS base URL`)
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error(`Invalid ${name}: expected an HTTPS base URL without credentials, query, or fragment`)
  }
  return url.href.replace(/\/+$/, '')
}

module.exports = { configuredBaseUrl }
