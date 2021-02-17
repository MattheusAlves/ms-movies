import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { BsSearch } from 'react-icons/bs'

interface Props {
  rightNav: boolean
}
const Search = (props: Props): JSX.Element => {
  const isNavActive = props.rightNav
  useEffect(() => setIsActive(false), [isNavActive])
  const [isActive, setIsActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const toggleActive = () => {
    if (searchQuery) {
      return handleSearch()
    }
    setIsActive(!isActive)
  }

  const handleSearch = () => {
    router.push(`/search/${searchQuery}`)
  }
  return (
    <div className="search-wrapper">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          className={isActive ? 'search-input active' : 'search-input'}
          placeholder="Search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </form>
      <BsSearch
        // color="#4b45ff"
        size={18}
        className="search-icon"
        onClick={toggleActive}
      />
    </div>
  )
}

export default Search
