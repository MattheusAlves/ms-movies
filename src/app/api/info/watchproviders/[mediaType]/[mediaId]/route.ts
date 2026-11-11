import { tmdb } from '@/util/tmdb'
import { jsonNoStore, tmdbErrorResponse } from '@/util/apiResponse'

type Context = { params: Promise<{ mediaType: string; mediaId: string }> }

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  try {
    const { mediaType, mediaId } = await params
    return jsonNoStore(await tmdb.watchProviders(mediaType, mediaId))
  } catch (error) {
    return tmdbErrorResponse(error)
  }
}
