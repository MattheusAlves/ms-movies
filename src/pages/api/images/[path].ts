import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    const image = await axios.get(
      `https://image.tmdb.org/t/p/w200/${req.query.path}`,
      { responseType: 'arraybuffer' }
    )
    // const data = Buffer.from(image.data).toString('base64')
    const data = Buffer.from(image.data)
    return res.end(data)
  } catch (e) {
    console.log(e)
    res.status(e.status || 400).json({ message: 'Api error' })
  }
}
