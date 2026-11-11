import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DetailView from './DetailView'
import { isValidTitleParams, loadTitle } from './detail-data'

type Props = { params: Promise<{ mediaType: string; mediaId: string }> }

// The Pages Router rendered details on each request. Deduplicate the title
// request between metadata and the page without caching it across requests.
export const dynamic = 'force-dynamic'
const getTitle = cache(loadTitle)

async function getDetail(params: Props['params']) {
  const { mediaType, mediaId } = await params
  if (!isValidTitleParams(mediaType, mediaId)) notFound()
  return getTitle(mediaType, mediaId)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await getDetail(params)
  return { title: `MS - ${data.title || data.name}` }
}

export default async function DetailPage({ params }: Props) {
  return <DetailView {...await getDetail(params)} />
}
