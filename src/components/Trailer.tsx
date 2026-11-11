'use client'

import React from 'react'

import styles from '@/styles/Media_info.module.scss'

import Spinner from '@/components/shared/Spinner'
import { useGetTrailer } from '@/actions/trailer'
import { endpoint } from '@/config/endpoint'

interface Props {
  mediaType: string
  mediaId: string
}
export default function Trailer({ mediaType, mediaId }: Props): React.JSX.Element {
  const { data, loading } = useGetTrailer({
    mediaType,
    mediaId
  })
  const videoKey: string | undefined = data?.results?.[0]?.key
  return (
    <div className={styles['media-trailer']}>
      {loading ? (
        <Spinner />
      ) : (
        videoKey && (
          <iframe
            src={endpoint.youtube.embed(videoKey)}
            frameBorder="0"
            allowFullScreen
            title="video"
          />
        )
      )}
    </div>
  )
}
