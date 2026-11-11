'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FcNext } from 'react-icons/fc'
import { IconContext } from 'react-icons'
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonNext
} from 'pure-react-carousel'
import 'pure-react-carousel/dist/react-carousel.es.css'

import { useGetActors } from '@/actions/actors'
import styles from '@/styles/Media_info.module.scss'
import { endpoint } from '@/config/endpoint'

const Persons = ({ mediaType, mediaId }): React.JSX.Element => {
  const { data, error } = useGetActors({ mediaType, mediaId })
  const [isNarrow, setIsNarrow] = useState(false)
  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(max-width: 762px)')
    const update = () => setIsNarrow(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return (
    <div className={styles['characters-container']}>
      {error && <p className="status-message" role="status">Cast information is temporarily unavailable.</p>}
      {data && (
        <CarouselProvider
          naturalSlideHeight={250}
          naturalSlideWidth={170}
          visibleSlides={isNarrow ? 3 : 6}
          totalSlides={data.length}
          className={styles['characters-slider-provider']}
          step={3} // the number of slides to move when pressing the button next
        >
          <Slider className={styles['characters-slider']}>
            {data.map(
              (person, index) =>
                person.profile_path && (
                  <Slide
                    index={index}
                    key={person.id}
                    className={styles['character-slide']}
                  >
                    <div className={styles['character-wrapper']}>
                      <div className={`${styles.loading}`}>
                        <Image
                          src={endpoint.tmdb.image(200, person.profile_path)}
                          width={170}
                          height={250}
                          quality={75}
                          alt={person.original_name || person.name || ''}
                          className={styles.poster}
                          onLoad={e =>
                            e.currentTarget.parentElement?.classList.remove(
                              styles.loading
                            )
                          }
                        />
                      </div>
                      <div className={styles['character-info-container']}>
                        <div className={styles['character-info-wrapper']}>
                          <p className={styles['character-info-name']}>
                            {person.character}
                          </p>
                          <p className={styles['character-info-original-name']}>
                            {person.original_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Slide>
                )
            )}
          </Slider>
          <ButtonNext className={styles['characters-slider-button-next']} aria-label="Next cast members">
            <IconContext.Provider value={{ color: '#4B45FF' }}>
              <FcNext size={30} />
            </IconContext.Provider>
          </ButtonNext>
        </CarouselProvider>
      )}
    </div>
  )
}

export default Persons
