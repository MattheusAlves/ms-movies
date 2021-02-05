import { useState } from 'react'

import Search from '@/components/Search'

const Header: React.FC = () => {
  const [isActive, setIsActive] = useState(false)

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
          <a href="#">Filmes</a>
        </li>
        <li>
          <a href="#">Séries</a>
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
