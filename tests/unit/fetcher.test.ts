// @vitest-environment node
import http from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import fetcher from '@/util/fetcher'

let server
let base

beforeAll(async () => {
  server = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json')
    if (req.url === '/error') {
      res.writeHead(429)
      res.end(JSON.stringify({ message: 'rate limited' }))
    } else {
      res.end(JSON.stringify({ page: 2, results: [{ id: 11 }] }))
    }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close(error => (error ? reject(error) : resolve()))
  )
})

describe('fetcher', () => {
  it('resolves JSON successes', async () => {
    expect(await fetcher(`${base}/page`)).toEqual({ page: 2, results: [{ id: 11 }] })
  })

  it('rejects with the API error body', async () => {
    await expect(fetcher(`${base}/error`)).rejects.toEqual({ message: 'rate limited' })
  })
})
