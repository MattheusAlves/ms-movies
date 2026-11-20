import { tmdbErrorStatus } from '@/util/tmdb'

export function jsonNoStore(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

export function tmdbErrorResponse(error: unknown): Response {
  const status = tmdbErrorStatus(error)
  return jsonNoStore({ message: status === 400 ? 'Invalid request' : 'Api error' }, status)
}
