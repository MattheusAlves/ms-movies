import React, { lazy, Suspense } from 'react'

import styles from '@/styles/Media_info.module.scss'

import ReactLoading from 'react-loading'
import { useGetTrailer } from '@/actions/trailer'

interface Props {
  mediaType: string
  mediaId: string
}
export default function Trailer({ mediaType, mediaId }: Props): JSX.Element {
  const { data, error, loading } = useGetTrailer({
    mediaType,
    mediaId
  })
  let URL: string
  if (data && data.results.length && data.results[0].key) {
    URL = data.results[0].key
  }
  return (
    <div className={styles['media-trailer']}>
      {loading ? (
        <ReactLoading type="cubes" color="#4b45ff" width="15%" height="15%" />
      ) : (
        URL && (
          <iframe
            src={`https://www.youtube.com/embed/${URL}`}
            frameBorder="0"
            allowFullScreen
            title="video"
          />
        )
      )}
    </div>
  )
}
