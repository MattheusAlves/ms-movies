import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'

import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'

const Header = (): React.JSX.Element => {
  const [isActive, setIsActive] = useState(false)
  const [transparent, setTransparent] = useState(true)
  const { contentType, changeContentType } = useContext(ContentTypeContext)
  useEffect(() => {
    const onScroll = () => setTransparent(window.scrollY <= 10)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  const toggleBurger = () => {
    setIsActive(!isActive)
  }
  return (
    <nav className={!transparent ? 'nav-bar' : 'nav-bar transparent'}>
      <div className="nav-bar-logo">
        <h1>MS - Filmes e Séries</h1>
      </div>
      <ul className={isActive ? 'nav-links nav-active' : 'nav-links'}>
        <li>
          <Search rightNav={isActive} />
        </li>
        <li>
          <Link
            href="/movies"
            className={contentType === 'movies' ? 'currentLink' : ''}
            onClick={() => changeContentType('movies')}
          >
            Filmes
          </Link>
        </li>
        <li>
          <Link
            href="/series"
            className={contentType === 'series' ? 'currentLink' : ''}
            onClick={() => changeContentType('series')}
          >
            Séries
          </Link>
        </li>
        <span className="separator" />
        <li>
          <Link href="/to-watch">Minha lista</Link>
        </li>
      </ul>
      <div className="burger" onClick={() => toggleBurger()}>
        <div
          className={isActive ? 'toggle burger-line1' : 'burger-line1'}
        ></div>
        <div
          className={isActive ? 'toggle burger-line2' : 'burger-line2'}
        ></div>
        <div
          className={isActive ? 'toggle burger-line3' : 'burger-line3'}
        ></div>
      </div>
    </nav>
  )
}
export default Header
