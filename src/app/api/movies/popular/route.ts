import { tmdb } from '@/util/tmdb'
import { jsonNoStore, tmdbErrorResponse } from '@/util/apiResponse'

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const pages = params.getAll('page')
  try {
    return jsonNoStore(await tmdb.discover('movie', pages.length > 1 ? pages : pages[0], {
      genre: params.get('genre'),
      decade: params.get('decade')
    }))
  } catch (error) {
    return tmdbErrorResponse(error)
  }
}
