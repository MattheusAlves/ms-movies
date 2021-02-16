import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Search from '@/components/shared/Search'

const Header = (): JSX.Element => {
  const [isActive, setIsActive] = useState(false)
  const router = useRouter()

  const toggleBurger = () => {
    setIsActive(!isActive)
  }

  return (
    <nav className="nav-bar">
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
              href="#"
              className={router.query.type === 'movies' ? 'currentLink' : ''}
            >
              Filmes
            </a>
          </Link>
        </li>
        <li>
          <Link href="/series">
            <a
              href="#"
              className={router.query.type === 'series' ? 'currentLink' : ''}
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
