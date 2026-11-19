'use client'

import { useState } from 'react'
import { useGetTrailer } from '@/actions/trailer'
import { endpoint } from '@/config/endpoint'
import styles from '@/styles/Media_info.module.scss'

export default function Trailer({ mediaType, mediaId, title }: { mediaType: string; mediaId: string; title: string }): React.JSX.Element {
  const { data, error, loading } = useGetTrailer({ mediaType, mediaId })
  const [playing, setPlaying] = useState(false)
  const youtube = data?.results?.filter(video => video.site === 'YouTube' && /^[A-Za-z0-9_-]+$/.test(video.key))
  const videoKey = (youtube?.find(video => video.type === 'Trailer') ?? youtube?.[0])?.key
  return (
    <section className={styles.section} aria-labelledby="trailer-heading">
      <div className={styles.sectionHeading}><div><p className="eyebrow">A closer look</p><h2 id="trailer-heading">Trailer</h2></div></div>
      {error ? <p className="status-message" role="status">Trailer information is temporarily unavailable.</p> : loading ? <p role="status">Loading trailer…</p> : videoKey ? (
        playing ? <div className={styles.video}><iframe src={endpoint.youtube.embed(videoKey)} title={`${title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> :
          <button className="button button--outline" type="button" onClick={() => setPlaying(true)}>▶ &nbsp; Play trailer</button>
      ) : <p className={styles.muted}>No trailer is available yet.</p>}
    </section>
  )
}
