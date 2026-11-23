import { isValidTitleParams, loadTitle } from '@/app/info/[mediaType]/[mediaId]/detail-data'
import { jsonNoStore } from '@/util/apiResponse'

export async function GET(_request: Request, { params }: { params: Promise<{ mediaType: string; mediaId: string }> }): Promise<Response> {
  const { mediaType, mediaId } = await params
  if (!isValidTitleParams(mediaType, mediaId)) return jsonNoStore({ message: 'Invalid request' }, 400)
  try {
    return jsonNoStore(await loadTitle(mediaType, mediaId))
  } catch {
    // loadTitle already strips upstream errors that can carry credentials.
    return jsonNoStore({ message: 'Api error' }, 500)
  }
}
