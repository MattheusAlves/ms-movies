import Image from 'next/image'
import BaseLayout from '@/components/layouts/BaseLayout'
import Persons from '@/components/Person'
import Trailer from '@/components/Trailer'
import WatchProviders from '@/components/WatchProviders'
import type { MediaType, TitleDetails } from './detail-data'
import styles from '@/styles/Media_info.module.scss'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'

export default function DetailView({ data, mediaType, imdbRating }: {
  data: TitleDetails
  mediaType: MediaType
  imdbRating: number | null
}) {
  const date = data.release_date || data.first_air_date
  return (
    <BaseLayout>
      <div className={styles['media-container']}>
        <div className={styles['media-wrapper']}>
          <div className={styles['media-presentation-wrapper']}>
            <div className={styles['media-presentation-poster-wrapper']}>
              <Image
                src={data.poster_path ? endpoint.tmdb.image(400, data.poster_path) : '/404.png'}
                alt={data.title || data.name || ''}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={styles['media-presentation-poster']}
              />
            </div>
            <div className={styles['media-presentation-info']}>
              <p className={styles['media-presentation-title']}>{data.title || data.name}</p>
              <p className={styles['media-presentation-overview']}>{data.overview}</p>
              <div className={styles.genres}>
                {(data.genres || []).map(genre => <span key={genre.id}>{genre.name}</span>)}
              </div>
              {date && (
                <div className={styles['release-date']}>
                  <span>{`${data.release_date ? 'Release date' : 'Premiere'}: ${date.split('-').reverse().join('/')}`}</span>
                </div>
              )}
              {!!data.budget && data.budget > 0 && (
                <div className={styles.budget}>
                  <span>{`Budget: ${data.budget.toLocaleString(contentConfig.language)} USD`}</span>
                </div>
              )}
              {data.number_of_seasons && (
                <div className={styles.seasons}>
                  <span>{`Seasons: ${data.number_of_seasons}`}</span>
                </div>
              )}
              <div className={styles['vote-average']}>
                <p>{`TMDB: ${data.vote_average}`}</p>
                {imdbRating != null && <p>{`IMDB: ${imdbRating}`}</p>}
              </div>
              <WatchProviders mediaType={mediaType} mediaId={String(data.id)} />
            </div>
          </div>
          <Trailer mediaId={String(data.id)} mediaType={mediaType} />
          <div className={styles['cast-wrapper']}>
            <Persons mediaType={mediaType} mediaId={data.id} />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
