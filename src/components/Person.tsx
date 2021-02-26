import Image from 'next/image'
import { isMobile, BrowserView } from 'react-device-detect'
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

const Persons = ({ mediaType, mediaId }): JSX.Element => {
  const { data, error, loading } = useGetActors({ mediaType, mediaId })
  // const [visibleSlides, setVisibleSlides] = useState(0)

  // useEffect(() => {
  //   console.log(window.innerWidth)
  //   if (window.innerWidth > 1800) {
  //     setVisibleSlides(4)
  //   } else if (window.innerWidth > 1080 && window.innerWidth < 1550) {
  //     setVisibleSlides(4)
  //   } else if (window.innerWidth <= 800) {
  //     setVisibleSlides(4)
  //   }
  // }, [data])

  return (
    <div className={styles['characters-container']}>
      {data && (
        <CarouselProvider
          naturalSlideHeight={250}
          naturalSlideWidth={170}
          visibleSlides={isMobile ? 3 : 5}
          totalSlides={data.length}
          className={styles['characters-slider-provider']}
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
                      <div
                        className={`${styles.characterImageWrapper} ${styles.loading}`}
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                          width={170}
                          height={250}
                          quality={75}
                          className={styles.loading}
                          onLoad={e =>
                            (e.target.parentElement.parentElement.classList = [])
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
          <BrowserView>
            <ButtonNext className={styles['characters-slider-button-next']}>
              <IconContext.Provider value={{ color: '#4B45FF' }}>
                <FcNext size={30} />
              </IconContext.Provider>
            </ButtonNext>
          </BrowserView>
        </CarouselProvider>
      )}
    </div>
  )
}

export default Persons
