import { tmdb } from '@/util/tmdb'
import { jsonNoStore, tmdbErrorResponse } from '@/util/apiResponse'

export async function GET(request: Request): Promise<Response> {
  const pages = new URL(request.url).searchParams.getAll('page')
  try {
    return jsonNoStore(await tmdb.discover('movie', pages.length > 1 ? pages : pages[0]))
  } catch (error) {
    return tmdbErrorResponse(error)
  }
}
