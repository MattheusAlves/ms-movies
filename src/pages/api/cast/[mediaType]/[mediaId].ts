import type { NextApiRequest, NextApiResponse } from 'next'

import { tmdbGet } from '@/util/tmdb'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

export default async function cast(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { mediaType, mediaId } = req.query
  try {
    const data = await tmdbGet<{ cast: Array<{ known_for_department: string; profile_path: string | null }> }>(
      endpoint.tmdb.credits(mediaType, mediaId), { language: contentConfig.language }
    )
    const actors = data.cast
      .filter(
        castMember =>
          castMember.known_for_department === 'Acting' && castMember.profile_path
      )
      .slice(0, 12)
    res.status(200).json(actors)
  } catch (e) {
    res.status(e.response?.status ?? 500).json({ message: 'Api error' })
  }
}
