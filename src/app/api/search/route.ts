import { tmdb } from '@/util/tmdb'
import { jsonNoStore, tmdbErrorResponse } from '@/util/apiResponse'

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const queries = params.getAll('query')
  const pages = params.getAll('page')
  try {
    return jsonNoStore(await tmdb.search(queries.length === 1 ? queries[0] : queries, pages.length > 1 ? pages : pages[0]))
  } catch (error) {
    return tmdbErrorResponse(error)
  }
}
