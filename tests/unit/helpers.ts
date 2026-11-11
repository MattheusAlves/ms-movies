import type {
  NextApiRequest,
  NextApiResponse
} from 'next'
import type { ParsedUrlQuery } from 'querystring'

// Runtime-optional doubles: the data loaders and API routes only read
// `query`/`params` and the response writer surface exercised here.
export const apiRequest = (query: ParsedUrlQuery): NextApiRequest =>
  ({ query } as unknown as NextApiRequest)

export interface RecordedResponse extends NextApiResponse {
  code: number | null
  body: unknown
}

export const recorder = (): RecordedResponse => {
  const res = {
    code: null as number | null,
    body: null as unknown,
    status(code: number) {
      this.code = code
      return res
    },
    json(body: unknown) {
      this.body = body
      return res
    }
  }
  return res as unknown as RecordedResponse
}
