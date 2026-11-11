import axios from 'axios'

// This module is only imported by the server-rendered search page.
export async function searchTitles(title: string) {
  try {
    const result = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: { api_key: process.env.API_KEY, query: title, language: 'en-US' }
    })
    return [result.data]
  } catch {
    // Upstream errors can contain the request URL and API key.
    throw new Error('Unable to load search data from TMDB')
  }
}
