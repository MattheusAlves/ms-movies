import { useState } from 'react'


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
          <a href="#" onClick={() => toggleBurger()}>
            Filmes
          </a>
        </li>
        <li>
          <a href="#">Séries</a>
        </li>
      </ul>
      <div className="burger" onClick={() => toggleBurger()}>
        <div className="burger-line1"></div>
        <div className="burger-line2"></div>
        <div className="burger-line3"></div>
      </div>
    </nav>
  )
}
export default Header
