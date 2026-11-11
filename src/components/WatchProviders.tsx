'use client'

import React from 'react'
import styles from '@/styles/Media_info.module.scss'
import { useGetWatchProviders } from '@/actions/watchProviders'
import { contentConfig } from '@/config/content'

interface Props {
  mediaType: string
  mediaId: string
}
export default function WatchProviders({
  mediaType,
  mediaId
}: Props): React.JSX.Element {
  const { data, error } = useGetWatchProviders({ mediaType, mediaId })
  const providers = data?.results?.[contentConfig.watchRegion]?.flatrate
  if (error) return <p className="status-message" role="status">Streaming availability is temporarily unavailable.</p>
  return providers?.length ? (
    <div className={styles['watch-provider-container']}>
      <p>Available in {contentConfig.watchRegionName} ▼</p>
      <div className={styles['watch-provider-wrapper']}>
        {providers.map((provider, index) => (
          <span key={index}>{provider.provider_name}</span>
        ))}
      </div>
    </div>
  ) : (
    <></>
  )
}
