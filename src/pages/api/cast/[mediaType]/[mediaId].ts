import type { NextApiRequest, NextApiResponse } from 'next'

import { tmdbGet } from '@/util/tmdb'

export default async function cast(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { mediaType, mediaId } = req.query
  try {
    const data = await tmdbGet(`3/${mediaType}/${mediaId}/credits`)
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
