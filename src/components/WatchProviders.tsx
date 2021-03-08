import React from 'react'
import styles from '@/styles/Media_info.module.scss'
import { useGetWatchProviders } from '@/actions/watchProviders'

export default function WatchProviders({ mediaType, mediaId }) {
  const { data, error, loading } = useGetWatchProviders({ mediaType, mediaId })
  console.log(data)
  return data?.results?.BR?.flatrate && data.results.BR.flatrate.length ? (
    <div className={styles['watch-provider-container']}>
      <p>Disponivel ▼</p>
      <div className={styles['watch-provider-wrapper']}>
        {data.results.BR.flatrate.map((provider, index) => (
          <span key={index}>{provider.provider_name}</span>
        ))}
      </div>
    </div>
  ) : (
    <></>
  )
}
