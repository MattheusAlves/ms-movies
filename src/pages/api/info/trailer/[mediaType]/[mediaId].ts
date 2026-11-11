import type { NextApiRequest, NextApiResponse } from 'next'

import { tmdbGet } from '@/util/tmdb'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

export default async function trailer(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { mediaType, mediaId } = req.query
  try {
    const data = await tmdbGet(endpoint.tmdb.videos(mediaType, mediaId), { language: contentConfig.language })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.response?.status ?? 500).json({ message: 'Api error' })
  }
}
