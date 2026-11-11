import type { NextApiRequest, NextApiResponse } from 'next'

import { tmdbGet } from '@/util/tmdb'

export default async function popular(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { page } = req.query
  try {
    const data = await tmdbGet('3/discover/tv', {
      sort_by: 'popularity.desc',
      language: 'pt-BR',
      page: page || 1
    })
    res.status(200).json(data)
  } catch (e) {
    res.status(e.response?.status ?? 500).json({ message: 'Api error' })
  }
}
