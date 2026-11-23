import { tmdb } from '@/util/tmdb'
import { jsonNoStore, tmdbErrorResponse } from '@/util/apiResponse'

type Context = { params: Promise<{ mediaType: string; mediaId: string }> }

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  try {
    const { mediaType, mediaId } = await params
    const cast = await tmdb.credits(mediaType, mediaId)
    return jsonNoStore(cast.filter(actor => actor.known_for_department === 'Acting' && actor.profile_path).slice(0, 12))
  } catch (error) {
    return tmdbErrorResponse(error)
  }
}
