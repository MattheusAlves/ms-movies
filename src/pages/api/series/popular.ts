import type { NextApiRequest, NextApiResponse } from 'next'

import { tmdbGet } from '@/util/tmdb'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

export default async function popular(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { page } = req.query
  try {
    const data = await tmdbGet(endpoint.tmdb.discover('tv'), {
      sort_by: contentConfig.discoverySort,
      language: contentConfig.language,
      page: page || 1
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.response?.status ?? 500).json({ message: 'Api error' })
  }
}
