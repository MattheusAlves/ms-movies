'use client'

import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'

import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'

const Header = (): React.JSX.Element => {
  const [isActive, setIsActive] = useState(false)
  const [transparent, setTransparent] = useState(true)
  const { contentType } = useContext(ContentTypeContext)
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
        <h1>MS - Movies and Series</h1>
      </div>
      <ul className={isActive ? 'nav-links nav-active' : 'nav-links'}>
        <li>
          <Search rightNav={isActive} />
        </li>
        <li>
          <Link
            href="/movies"
            className={contentType === 'movies' ? 'currentLink' : ''}
          >
            Movies
          </Link>
        </li>
        <li>
          <Link
            href="/series"
            className={contentType === 'series' ? 'currentLink' : ''}
          >
            Series
          </Link>
        </li>
        <span className="separator" />
        <li>
          <Link href="/to-watch">My watchlist</Link>
        </li>
      </ul>
      <button type="button" className="burger" onClick={() => toggleBurger()} aria-label="Toggle navigation" aria-expanded={isActive}>
        <div
          className={isActive ? 'toggle burger-line1' : 'burger-line1'}
        ></div>
        <div
          className={isActive ? 'toggle burger-line2' : 'burger-line2'}
        ></div>
        <div
          className={isActive ? 'toggle burger-line3' : 'burger-line3'}
        ></div>
      </button>
    </nav>
  )
}
export default Header
