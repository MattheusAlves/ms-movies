import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import axios from 'axios'

import BaseLayout from '@/components/layouts/BaseLayout'
import Persons from '@/components/Person'
import Trailer from '@/components/Trailer'
import WatchProviders from '@/components/WatchProviders'

import styles from '@/styles/Media_info.module.scss'

const Title = ({ data, mediaType, imdbRating }): React.JSX.Element => {
  return (
    <BaseLayout>
      <div className={styles['media-container']}>
        <Head>
          <title>{`MS - ${data.title || data.name}`}</title>
        </Head>
        <div className={styles['media-wrapper']}>
          <div className={styles['media-presentation-wrapper']}>
            <div className={styles['media-presentation-poster-wrapper']}>
              <Image
                src={
                  data.poster_path
                    ? `https://image.tmdb.org/t/p/w400${data.poster_path}`
                    : '/404.png'
                }
                alt={data.title || data.name || ''}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={styles['media-presentation-poster']}
              />
            </div>
            <div className={styles['media-presentation-info']}>
              <p className={styles['media-presentation-title']}>
                {data.title || data.name}
              </p>
              <p className={styles['media-presentation-overview']}>
                {data.overview}
              </p>
              <div className={styles.genres}>
                {data.genres.map(genre => (
                  <span key={genre.id}>{genre.name}</span>
                ))}
              </div>

              <div className={styles['release-date']}>
                {data.release_date ? (
                  <span>{`Lançamento: ${data.release_date
                    .split('-')
                    .reverse()
                    .join('/')}`}</span>
                ) : (
                  <span>{`Estreia: ${data.first_air_date
                    .split('-')
                    .reverse()
                    .join('/')}`}</span>
                )}
              </div>
              {!!data.budget && data.budget > 0 && (
                <div className={styles.budget}>
                  <span>{`Orçamento: ${parseInt(data.budget).toLocaleString(
                    'US'
                  )} USD`}</span>
                </div>
              )}

              {data.number_of_seasons && (
                <div className={styles.seasons}>
                  <span>{`Temporadas: ${data.number_of_seasons}`}</span>
                </div>
              )}

              <div className={styles['vote-average']}>
                <p>{`TMDB: ${data.vote_average}`}</p>
                {imdbRating != null && <p>{`IMDB: ${imdbRating}`}</p>}
              </div>
              <WatchProviders mediaType={mediaType} mediaId={data.id} />
            </div>
          </div>
          <Trailer mediaId={data.id} mediaType={mediaType} />
          <div className={styles['cast-wrapper']}>
            <Persons mediaType={mediaType} mediaId={data.id} />
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const tmdbUrl =
    context.params.mediaType === 'movie'
      ? `https://api.themoviedb.org/3/movie/${context.params.mediaId}?language=pt-BR`
      : `https://api.themoviedb.org/3/tv/${context.params.mediaId}?language=pt-BR`
  let result
  try {
    result = await axios.get(tmdbUrl, {
      params: {
        api_key: process.env.API_KEY
      }
    })
  } catch {
    throw new Error('Unable to load title data from TMDB')
  }
  let imdbRating = null
  if (result.data.imdb_id && process.env.RAPIDAPI_KEY) {
    try {
      const imdbResult = await axios.get(
        'https://imdb8.p.rapidapi.com/title/get-overview-details',
        {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'imdb8.p.rapidapi.com'
          },
          params: { tconst: result.data.imdb_id },
          timeout: 3000
        }
      )
      const rating = imdbResult.data?.ratings?.rating
      if (typeof rating === 'number' && Number.isFinite(rating)) {
        imdbRating = rating
      }
    } catch {
      // IMDb ratings are optional; keep the detail page available on failure.
    }
  }
  return {
    props: { data: result.data, mediaType: context.params.mediaType, imdbRating }
  }
}

export default Title
