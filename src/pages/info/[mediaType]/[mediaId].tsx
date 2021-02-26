import { GetServerSideProps } from 'next'
import Image from 'next/image'
import axios from 'axios'

import BaseLayout from '@/components/layouts/BaseLayout'
import Persons from '@/components/Person'
import styles from '@/styles/Media_info.module.scss'

const Title = ({ data, mediaType }): JSX.Element => {
  return (
    <BaseLayout>
      <div className={styles['media-container']}>
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
                {data.original_title}
              </p>
              <p className={styles['media-presentation-overview']}>
                {data.overview}
              </p>
              <div className={styles['vote-average']}>
                <p>{`TMDB: ${data.vote_average}`}</p>
              </div>
            </div>
          </div>

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
