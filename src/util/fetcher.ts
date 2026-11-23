const fetcher = <T = unknown>(url: string): Promise<T> =>
  fetch(url).then(async res => {
    const result = await res.json() as T
    if (res.status !== 200 && res.status !== 304) {
      return Promise.reject(result)
    } else {
      return result
    }
  })

export default fetcher
