import useSWR from 'swr'

interface Props {
  data?: Record<string, any>
  error?: Record<string, any>
  loading?: boolean
}

const fetcher = (url: string) =>
  fetch(url).then(async res => {
    const result = await res.json()
    if (res.status !== 200) {
      return Promise.reject(result)
    } else {
      return result
    }
  })
const imageFetcher = (url: string) =>
  fetch(url).then(async res => {
    const result = res
    if (res.status !== 200) {
      return Promise.reject(result)
    } else {
      console.log(res)
      return toBase64(res)
    }
  })

function toBase64(arr) {
  const arrayBufferView = new Uint8Array(arr)
  const blob = new Blob([arrayBufferView], { type: 'image/jpeg' })
  const urlCreator = window.URL || window.webkitURL
  const imageUrl = urlCreator.createObjectURL(blob)
  return imageUrl
}
export const useGetPopularMovies = (): Props => {
  const { data, error, ...rest } = useSWR('/api/movies/popular', fetcher)
  return { data, error, loading: !data && !error, ...rest }
}

export const useGetImages = (path: string): Props => {
  const { data, error, ...rest } = useSWR(
    path ? `/api/images${path}` : null,
    imageFetcher
  )
  return { data, error, loading: !data && !error, ...rest }
}
