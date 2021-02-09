import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function popular(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { page } = req.query
  try {
    const movies = await axios.get(
      'https://api.themoviedb.org/4/discover/movie?sort_by=popularity.desc',
      {
        params: {
          api_key: '2d33c77063aa0a5a20bcf4682a1c151c',
          page: page || 1
        }
      }
    )
    const data = movies.data
    res.status(200).json(data)
  } catch (e) {
    console.log(e)
    res.status(e.status || 400).json({ message: 'Api error' })
  }
}
