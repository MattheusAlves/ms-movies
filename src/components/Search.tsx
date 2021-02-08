import { useState, useEffect } from 'react'
import { BsSearch } from 'react-icons/bs'

interface Props {
  rightNav: boolean
}
const Search = (props: Props): JSX.Element => {
  const [isActive, setIsActive] = useState(false)
  const isNavActive = props.rightNav
  useEffect(() => setIsActive(false), [isNavActive])
  const toggleActive = () => setIsActive(!isActive)
  return (
    <div className="search-wrapper">
      <input
        type="search"
        className={isActive ? 'search-input active' : 'search-input'}
      />
      <BsSearch
        // color="#4b45ff"
        size={22}
        className="search-icon"
        onClick={toggleActive}
      />
    </div>
  )
}

export default Search
