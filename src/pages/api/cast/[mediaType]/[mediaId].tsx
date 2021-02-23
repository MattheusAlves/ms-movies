import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function popular(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { mediaType, mediaId } = req.query
    const result = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits`,
      {
        params: {
          api_key: '2d33c77063aa0a5a20bcf4682a1c151c'
        }
      }
    )
    const actors = result.data.cast
      .filter(
        caster =>
          caster.known_for_department === 'Acting' && caster.profile_path
      )
      .slice(0, 12)
    res.status(200).json(actors)
  } catch (e) {
    console.log(e.data)
    res.status(e.status || 400).json({ message: 'Api error' })
  }
}
