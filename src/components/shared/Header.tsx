'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'

export default function Header(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [transparent, setTransparent] = useState(true)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { contentType } = useContext(ContentTypeContext)
  const { storageWarning } = useContext(ToWatchListContext)
  useEffect(() => {
    const onScroll = () => setTransparent(window.scrollY <= 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <header className={transparent ? 'site-header site-header--transparent' : 'site-header'}>
        <nav className="site-nav" aria-label="Primary navigation" onKeyDown={event => {
          if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus() }
        }}>
          <Link className="brand" href="/movies" aria-label="MS Movies and series home" onClick={() => setOpen(false)}>
            <span className="brand-mark">MS<span>.</span></span>
          </Link>
          <button ref={menuButton} className="burger" type="button" aria-label="Toggle navigation" aria-expanded={open} aria-controls="primary-menu" onClick={() => setOpen(!open)}>
            <span></span><span></span>
          </button>
          <div id="primary-menu" className={open ? 'nav-panel nav-panel--open' : 'nav-panel'}>
            <ul className="nav-links">
              <li><Link href="/movies" aria-current={contentType === 'movies' ? 'page' : undefined} onClick={() => setOpen(false)}>Movies</Link></li>
              <li><Link href="/series" aria-current={contentType === 'series' ? 'page' : undefined} onClick={() => setOpen(false)}>Series</Link></li>
              <li><Link href="/to-watch" onClick={() => setOpen(false)}>My watchlist</Link></li>
            </ul>
            <Search onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      </header>
      {storageWarning && <p className="watchlist-warning" role="alert">{storageWarning}</p>}
    </>
  )
}
