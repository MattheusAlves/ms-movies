import { useEffect, useState } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import axios from 'axios'

import BaseLayout from '@/components/layouts/BaseLayout'
import Persons from '@/components/Person'
import Trailer from '@/components/Trailer'
import WatchProviders from '@/components/WatchProviders'

import styles from '@/styles/Media_info.module.scss'

const Title = ({ data, mediaType }): JSX.Element => {
  const [imdbData, setImdbData] = useState(null)
  useEffect(() => {
    if (data.imdb_id) {
      axios
        .get('https://imdb8.p.rapidapi.com/title/get-overview-details', {
          headers: {
            'x-rapidapi-key':
              '908a629198mshdf8842af79b611dp14c1f5jsnf5e99182c91b',
            'x-rapidapi-host': 'imdb8.p.rapidapi.com'
          },
          params: {
            tconst: data.imdb_id
          }
        })
        .then(result => setImdbData(result.data))
        .catch(err => console.log(err.err))
    }
  }, [data])
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
                src={`https://image.tmdb.org/t/p/w400${data.poster_path}`}
                width={316}
                height={400}
                quality={80}
                layout="responsive"
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

              {data.budget && (
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
                <p>{`IMDB: ${imdbData ? imdbData.ratings.rating : ''}`}</p>
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
  const URL =
    context.params.mediaType === 'movie'
      ? `https://api.themoviedb.org/3/movie/${context.params.mediaId}`
      : `https://api.themoviedb.org/3/tv/${context.params.mediaId}`
  const result = await axios.get(URL, {
    params: {
      api_key: process.env.API_KEY
    }
  })
  return { props: { data: result.data, mediaType: context.params.mediaType } }
}

export default Title
