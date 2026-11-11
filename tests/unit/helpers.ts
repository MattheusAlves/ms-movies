import type {
  GetServerSidePropsContext,
  GetStaticPropsContext,
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

export const ssvContext = (params: ParsedUrlQuery): GetServerSidePropsContext =>
  ({ params } as unknown as GetServerSidePropsContext)

export const ssgContext = (params: ParsedUrlQuery): GetStaticPropsContext =>
  ({ params } as unknown as GetStaticPropsContext)

// Unwraps `{ props }` from the GetServerSidePropsResult/GetStaticPropsResult
// union (the other branch is `redirect`, never produced by these pages).
// Loaders are typed to allow a sync return, so accept both shapes.
export const propsOf = async (loader: unknown): Promise<Record<string, any>> => {
  const result = (await loader) as { props?: Record<string, any> }
  if (!result?.props) throw new Error('loader returned no props')
  return result.props
}
