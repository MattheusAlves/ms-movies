import { useNavigation } from '@/contexts/NavigationContext'
import { useState, useEffect } from 'react'
import { BsSearch } from 'react-icons/bs'
interface Props {
  rightNav: boolean
}
const Search = (props: Props): React.JSX.Element => {
  const isNavActive = props.rightNav
  const [isActive, setIsActive] = useState(false)
  // Closing or opening the mobile menu resets the search control.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsActive(false), [isNavActive])
  const [searchQuery, setSearchQuery] = useState('')
  const router = useNavigation()

  const toggleActive = () => {
    if (searchQuery) {
      return handleSearch()
    }
    setIsActive(!isActive)
  }

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/search/${encodeURIComponent(query)}`)
  }
  return (
    <div className="search-wrapper">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          className={isActive ? 'search-input active' : 'search-input'}
          placeholder="Search"
          aria-label="Search movies and series"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </form>
      <BsSearch
        size={18}
        className="search-icon"
        onClick={toggleActive}
      />
    </div>
  )
}

export default Search
