'use client'

import { useGetWatchProviders } from '@/actions/watchProviders'
import { contentConfig } from '@/config/content'
import styles from '@/styles/Media_info.module.scss'

export default function WatchProviders({ mediaType, mediaId }: { mediaType: string; mediaId: string }): React.JSX.Element {
  const { data, error, loading } = useGetWatchProviders({ mediaType, mediaId })
  const region = data?.results?.[contentConfig.watchRegion]
  const groups = [
    ['Stream', region?.flatrate],
    ['Rent', region?.rent],
    ['Buy', region?.buy],
    ['Free', region?.free],
    ['Free with ads', region?.ads]
  ] as const
  const hasProviders = groups.some(([, providers]) => providers?.length)
  return (
    <section className={styles.section} aria-labelledby="providers-heading">
      <div className={styles.sectionHeading}><div><p className="eyebrow">Where to watch</p><h2 id="providers-heading">Available in {contentConfig.watchRegionName}</h2></div><span>Availability may change</span></div>
      {error ? <p className="status-message" role="status">Streaming availability is temporarily unavailable.</p> : loading ? <p role="status">Checking availability…</p> : hasProviders ? (
        <div className={styles.providerGroups}>{groups.map(([label, providers]) => providers?.length ? (
          <div key={label}><h3>{label}</h3><ul>{providers.map((provider, index) => <li key={provider.provider_id ?? `${provider.provider_name}-${index}`}>{provider.provider_name}</li>)}</ul></div>
        ) : null)}</div>
      ) : <p className={styles.muted}>No streaming availability is listed for {contentConfig.watchRegionName}.</p>}
    </section>
  )
}
