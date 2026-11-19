import Link from 'next/link'
import BaseLayout from '@/components/layouts/BaseLayout'
import DetailPoster from '@/components/DetailPoster'
import Persons from '@/components/Person'
import Trailer from '@/components/Trailer'
import WatchProviders from '@/components/WatchProviders'
import WatchlistButton from '@/components/shared/WatchlistButton'
import { normalizeMediaItem } from '@/util/media'
import type { MediaType, TitleDetails } from './detail-data'
import styles from '@/styles/Media_info.module.scss'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'
import { imageConfig } from '@/config/images'

export default function DetailView({ data, mediaType, imdbRating }: {
  data: TitleDetails
  mediaType: MediaType
  imdbRating: number | null
}) {
  const title = data.title || data.name || 'Untitled'
  const date = data.release_date || data.first_air_date
  const item = normalizeMediaItem({ ...data, media_type: mediaType })
  const isMovie = mediaType === 'movie'
  return (
    <BaseLayout>
      <main id="main-content" className={styles.page} tabIndex={-1}>
        <p className={styles.breadcrumb}><Link href={isMovie ? '/movies' : '/series'}>{isMovie ? 'Movies' : 'Series'}</Link><span aria-hidden="true"> / </span>{title}</p>
        <article className={styles.hero}>
          <div className={styles.poster}><DetailPoster src={data.poster_path ? endpoint.tmdb.image(imageConfig.posterWidth, data.poster_path) : '/404.png'} title={title} className={styles.posterImage} /></div>
          <div className={styles.intro}>
            <p className="eyebrow">{isMovie ? 'Film' : 'Series'} / {date ? date.slice(0, 4) : 'Year unavailable'}</p>
            <h1>{title}<span>.</span></h1>
            {data.genres?.length ? <ul className={styles.genres} aria-label="Genres">{data.genres.map(genre => <li key={genre.id}>{genre.name}</li>)}</ul> : null}
            <p className={styles.overview}>{data.overview || 'No synopsis is available for this title yet.'}</p>
            <dl className={styles.facts}>
              <div><dt>TMDB score</dt><dd>{data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : 'Not rated'}</dd></div>
              {imdbRating != null && <div><dt>IMDb score</dt><dd>{imdbRating.toFixed(1)} / 10</dd></div>}
              {date && <div><dt>{isMovie ? 'Released' : 'First aired'}</dt><dd>{date}</dd></div>}
              {data.number_of_seasons ? <div><dt>Seasons</dt><dd>{data.number_of_seasons}</dd></div> : null}
              {data.budget ? <div><dt>Budget</dt><dd>{data.budget.toLocaleString(contentConfig.language)} USD</dd></div> : null}
            </dl>
            <WatchlistButton item={item} variant="detail" />
          </div>
        </article>
        <WatchProviders mediaType={mediaType} mediaId={String(data.id)} />
        <Trailer mediaId={String(data.id)} mediaType={mediaType} title={title} />
        <Persons mediaType={mediaType} mediaId={data.id} />
      </main>
    </BaseLayout>
  )
}
