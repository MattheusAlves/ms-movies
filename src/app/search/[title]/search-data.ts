import axios from 'axios'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

// This module is only imported by the server-rendered search page.
export async function searchTitles(title: string) {
  try {
    const result = await axios.get(endpoint.tmdb.url(endpoint.tmdb.search), {
      params: { api_key: process.env.API_KEY, query: title, language: contentConfig.language }
    })
    return [result.data]
  } catch {
    // Upstream errors can contain the request URL and API key.
    throw new Error('Unable to load search data from TMDB')
  }
}
