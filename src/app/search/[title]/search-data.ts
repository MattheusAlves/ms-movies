import { tmdb } from '@/util/tmdb'

// This module is only imported by the server-rendered search page.
export async function searchTitles(title: string) {
  try {
    return [await tmdb.search(title)]
  } catch {
    // Upstream errors can contain the request URL and API key.
    throw new Error('Unable to load search data from TMDB')
  }
}
