import Image from 'next/image'
import DetailPoster from '@/components/DetailPoster'
import Persons from '@/components/Person'
import Trailer from '@/components/Trailer'
import WatchProviders from '@/components/WatchProviders'
import WatchlistButton from '@/components/shared/WatchlistButton'
import { normalizeMediaItem } from '@/util/media'
import type { MediaType, TitleDetails } from './detail-data'
import styles from '@/styles/Media_info.module.scss'
import { endpoint } from '@/config/endpoint'
import { contentConfig } from '@/config/content'
import { imageConfig } from '@/config/images'

// Title detail body shared by the standalone page and the intercepted modal.
export default function DetailContent({ data, mediaType, imdbRating, modal = false }: {
  data: TitleDetails
  mediaType: MediaType
  imdbRating: number | null
  modal?: boolean
}) {
  const title = data.title || data.name || 'Untitled'
  const date = data.release_date || data.first_air_date
  const item = normalizeMediaItem({ ...data, media_type: mediaType })
  const isMovie = mediaType === 'movie'
  return (
    <>
      <div className={styles.detailCover}>
        {(data.backdrop_path || data.poster_path) && (
          <div className={`${styles.backdrop} detail-backdrop`} aria-hidden="true">
            <Image
              src={endpoint.tmdb.image(data.backdrop_path ? imageConfig.backdropHeroWidth : imageConfig.posterWidth, (data.backdrop_path || data.poster_path)!)}
              alt=""
              fill
              sizes="100vw"
              className={data.backdrop_path ? styles.backdropImage : styles.backdropPoster}
            />
          </div>
        )}
        <article className={styles.hero}>
          <div className={styles.poster}><DetailPoster src={data.poster_path ? endpoint.tmdb.image(imageConfig.posterWidth, data.poster_path) : '/404.png'} title={title} className={styles.posterImage} /></div>
          <div className={styles.intro}>
            <p className="eyebrow">{isMovie ? 'Film' : 'Series'} / {date ? date.slice(0, 4) : 'Year unavailable'}</p>
            <h1 id="detail-title">{title}<span>.</span></h1>
            {data.tagline && <p className={styles.tagline}>{data.tagline}</p>}
            {data.genres?.length ? <ul className={styles.genres} aria-label="Genres">{data.genres.map(genre => <li key={genre.id}>{genre.name}</li>)}</ul> : null}
            <p className={styles.overview}>{data.overview || 'No synopsis is available for this title yet.'}</p>
            <dl className={styles.facts}>
              <div><dt>TMDB score</dt><dd>{data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : 'Not rated'}</dd></div>
              {imdbRating != null && <div><dt>IMDb score</dt><dd>{imdbRating.toFixed(1)} / 10</dd></div>}
              {date && <div><dt>{isMovie ? 'Released' : 'First aired'}</dt><dd>{date}</dd></div>}
              {data.number_of_seasons ? <div><dt>Seasons</dt><dd>{data.number_of_seasons}</dd></div> : null}
              {data.number_of_episodes ? <div><dt>Episodes</dt><dd>{data.number_of_episodes}</dd></div> : null}
              {(data.episode_run_time?.[0] || data.runtime) ? <div><dt>{isMovie ? 'Runtime' : 'Episode runtime'}</dt><dd>{isMovie ? data.runtime : data.episode_run_time?.[0]} min</dd></div> : null}
              {data.budget ? <div><dt>Budget</dt><dd>{data.budget.toLocaleString(contentConfig.language)} USD</dd></div> : null}
              {data.revenue ? <div><dt>Revenue</dt><dd>{data.revenue.toLocaleString(contentConfig.language)} USD</dd></div> : null}
              {data.networks?.length ? <div><dt>Network</dt><dd>{data.networks.map(network => network.name).join(', ')}</dd></div> : null}
              {data.status ? <div><dt>Status</dt><dd>{data.status}</dd></div> : null}
            </dl>
            <WatchlistButton item={item} variant="detail" />
          </div>
        </article>
      </div>
      {modal ? (
        <div className={styles.modalContent}>
          <WatchProviders mediaType={mediaType} mediaId={String(data.id)} />
          <Trailer mediaId={String(data.id)} mediaType={mediaType} title={title} />
          <Persons mediaType={mediaType} mediaId={data.id} />
        </div>
      ) : (
        <>
          <WatchProviders mediaType={mediaType} mediaId={String(data.id)} />
          <Trailer mediaId={String(data.id)} mediaType={mediaType} title={title} />
          <Persons mediaType={mediaType} mediaId={data.id} />
        </>
      )}
    </>
  )
}
