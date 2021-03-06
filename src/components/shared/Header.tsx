import { useState, useContext } from 'react'
import Link from 'next/link'

import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { HeaderContext } from '@/contexts/HeaderContext'

const Header = (): JSX.Element => {
  const [isActive, setIsActive] = useState(false)
  const { contentType, changeContentType } = useContext(ContentTypeContext)
  const { transparent } = useContext(HeaderContext)

  const toggleBurger = () => {
    setIsActive(!isActive)
  }
  return (
    <nav className={!transparent ? 'nav-bar' : 'nav-bar transparent'}>
      <div className="nav-bar-logo">
        <h4>MS - Filmes e Séries</h4>
      </div>
      <ul className={isActive ? 'nav-links nav-active' : 'nav-links'}>
        <li>
          <Search rightNav={isActive} />
        </li>
        <li>
          <Link href="/movies">
            <a
              className={contentType === 'movies' ? 'currentLink' : ''}
              onClick={() => changeContentType('movies')}
            >
              Filmes
            </a>
          </Link>
        </li>
        <li>
          <Link href="/series">
            <a
              className={contentType === 'series' ? 'currentLink' : ''}
              onClick={() => changeContentType('series')}
            >
              Séries
            </a>
          </Link>
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
