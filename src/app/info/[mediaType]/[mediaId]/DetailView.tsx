import Link from 'next/link'
import BaseLayout from '@/components/layouts/BaseLayout'
import DetailContent from './DetailContent'
import type { MediaType, TitleDetails } from './detail-data'
import styles from '@/styles/Media_info.module.scss'

export default function DetailView({ data, mediaType, imdbRating }: {
  data: TitleDetails
  mediaType: MediaType
  imdbRating: number | null
}) {
  const title = data.title || data.name || 'Untitled'
  const isMovie = mediaType === 'movie'
  return (
    <BaseLayout>
      <main id="main-content" className={styles.page} tabIndex={-1}>
        <p className={styles.breadcrumb}><Link href={isMovie ? '/movies' : '/series'}>{isMovie ? 'Movies' : 'Series'}</Link><span aria-hidden="true"> / </span>{title}</p>
        <DetailContent data={data} mediaType={mediaType} imdbRating={imdbRating} />
      </main>
    </BaseLayout>
  )
}
