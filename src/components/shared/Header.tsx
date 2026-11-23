'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Search from '@/components/shared/Search'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'
import { browseDecades, browseGenres, browseHref } from '@/config/browse'

export default function Header(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [transparent, setTransparent] = useState(true)
  const menuButton = useRef<HTMLButtonElement>(null)
  const browseButton = useRef<HTMLButtonElement>(null)
  const browsePanel = useRef<HTMLDivElement>(null)
  const { contentType } = useContext(ContentTypeContext)
  const { storageWarning } = useContext(ToWatchListContext)
  const resource = contentType === 'series' ? 'series' : 'movies'

  useEffect(() => {
    const onScroll = () => setTransparent(window.scrollY <= 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!browseOpen) return
    const onPointer = (event: PointerEvent) => {
      if (!browsePanel.current?.contains(event.target as Node) && !browseButton.current?.contains(event.target as Node)) setBrowseOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [browseOpen])

  return (
    <>
      <header className={transparent ? 'site-header site-header--transparent' : 'site-header'}>
        <nav className="site-nav" aria-label="Primary navigation" onKeyDown={event => {
          if (event.key === 'Escape') {
            if (browseOpen) { setBrowseOpen(false); browseButton.current?.focus() }
            else if (open) { setOpen(false); menuButton.current?.focus() }
          }
        }}>
          <Link className="brand" href="/movies" aria-label="MS. Cinema & series — home" onClick={() => { setOpen(false); setBrowseOpen(false) }}>
            <span className="brand-mark">MS<span>.</span></span>
            <span className="brand-sub" aria-hidden="true">Cinema<br />& series</span>
          </Link>
          <button ref={menuButton} className="burger" type="button" aria-label="Toggle navigation" aria-expanded={open} aria-controls="primary-menu" onClick={() => setOpen(!open)}>
            <span></span><span></span>
          </button>
          <div id="primary-menu" className={open ? 'nav-panel nav-panel--open' : 'nav-panel'}>
            <ul className="nav-links">
              <li className="browse-item">
                <button
                  ref={browseButton}
                  type="button"
                  className="browse-trigger"
                  aria-expanded={browseOpen}
                  aria-controls="browse-menu"
                  aria-haspopup="true"
                  onClick={() => setBrowseOpen(!browseOpen)}
                >
                  Browse <svg className="browse-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div id="browse-menu" ref={browsePanel} className={browseOpen ? 'browse-menu t-dropdown is-open' : 'browse-menu t-dropdown'} aria-label="Browse the catalogue">
                  <div className="browse-menu-head"><strong>Browse the catalogue</strong><span>{resource === 'movies' ? 'Films' : 'Series'}</span></div>
                  <div className="browse-menu-cols">
                    <div>
                      <h2>Genres</h2>
                      <ul>
                        {browseGenres.map(genre => (
                          <li key={genre.id}>
                            <Link href={browseHref(resource, { genre: genre.id })} onClick={() => { setBrowseOpen(false); setOpen(false) }}>{genre.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2>Decades</h2>
                      <ul>
                        {browseDecades.map(decade => (
                          <li key={decade}>
                            <Link href={browseHref(resource, { decade })} onClick={() => { setBrowseOpen(false); setOpen(false) }}>{decade}s</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2>On the shelf</h2>
                      <ul>
                        <li><Link href="/movies" onClick={() => { setBrowseOpen(false); setOpen(false) }}>All films</Link></li>
                        <li><Link href="/series" onClick={() => { setBrowseOpen(false); setOpen(false) }}>All series</Link></li>
                        <li><Link href="/to-watch" onClick={() => { setBrowseOpen(false); setOpen(false) }}>Saved titles</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="browse-menu-foot">
                    <span>Filter the catalogue</span>
                    <Link href={browseHref(resource)} onClick={() => { setBrowseOpen(false); setOpen(false) }}>
                      See the full catalogue
                      <svg width="14" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" /></svg>
                    </Link>
                  </div>
                </div>
              </li>
              <li><Link href="/movies" aria-current={contentType === 'movies' ? 'page' : undefined} onClick={() => { setOpen(false); setBrowseOpen(false) }}>Movies</Link></li>
              <li><Link href="/series" aria-current={contentType === 'series' ? 'page' : undefined} onClick={() => { setOpen(false); setBrowseOpen(false) }}>Series</Link></li>
              <li><Link href="/to-watch" onClick={() => { setOpen(false); setBrowseOpen(false) }}>My watchlist</Link></li>
            </ul>
            <Search onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      </header>
      {storageWarning && <p className="watchlist-warning" role="alert">{storageWarning}</p>}
    </>
  )
}
