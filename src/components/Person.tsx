'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useGetActors } from '@/actions/actors'
import { endpoint } from '@/config/endpoint'
import { imageConfig } from '@/config/images'
import styles from '@/styles/Media_info.module.scss'
import { configuredBaseUrl } from '@/config/base-url.cjs'

function CastPortrait({ path, name }: { path: string; name: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={styles.castPortraitWrapper}>
      <Image
        src={
          failed
            ? '/404.png'
            : endpoint.tmdb.image(imageConfig.profileWidth, path)
        }
        width={144}
        height={200}
        sizes="144px"
        alt={name}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export default function Persons({
  mediaType,
  mediaId
}: {
  mediaType: string
  mediaId: number
}): React.JSX.Element {
  const { data, error, loading } = useGetActors({ mediaType, mediaId })

  return (
    <section className={styles.section} aria-labelledby="cast-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className="eyebrow">The people</p>
          <h2 id="cast-heading">Cast</h2>
        </div>
        <span>Scroll to explore →</span>
      </div>
      {error ? (
        <p className="status-message" role="status">
          Cast information is temporarily unavailable.
        </p>
      ) : loading ? (
        <p role="status">Loading cast…</p>
      ) : data?.length ? (
        <ul
          className={styles.castList}
          tabIndex={0}
          aria-label="Cast members, scroll horizontally"
        >
          {data
            .filter(person => person.profile_path)
            .map(person => (
              <li key={person.id} className={styles.castCard}>
                <a
                  href={`${configuredBaseUrl(process.env.NEXT_PUBLIC_TMDB_PERSON_URL, 'NEXT_PUBLIC_TMDB_PERSON_URL')}/${person.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CastPortrait
                    path={person.profile_path!}
                    name={person.name || person.original_name || 'Cast member'}
                  />
                  <strong>{person.name || person.original_name}</strong>
                  <span>{person.character || 'Cast'}</span>
                </a>
              </li>
            ))}
        </ul>
      ) : (
        <p className={styles.muted}>No cast information is available yet.</p>
      )}
    </section>
  )
}
