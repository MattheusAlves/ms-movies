const fetcher = (url: string) =>
  fetch(url).then(async res => {
    const result = await res.json()
    if (res.status !== 200) {
      return Promise.reject(result)
    } else {
      return result
    }
  })

export default fetcher
