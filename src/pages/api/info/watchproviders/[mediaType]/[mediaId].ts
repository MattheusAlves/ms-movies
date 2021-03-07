import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function watchProviders(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { mediaType, mediaId } = req.query
  try {
    const movies = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}/watch/providers`,
      {
        params: {
          api_key: process.env.API_KEY
        }
      }
    )
    const data = movies.data
    res.status(200).json(data)
  } catch (e) {
    console.log(e.data)
    res.status(e.status || 400).json({ message: 'Api error' })
  }
}
