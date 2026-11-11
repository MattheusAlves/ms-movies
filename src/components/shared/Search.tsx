import { useRouter } from 'next/router'
import { useState, useEffect, useContext } from 'react'
import { BsSearch } from 'react-icons/bs'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
interface Props {
  rightNav: boolean
}
const Search = (props: Props): React.JSX.Element => {
  const isNavActive = props.rightNav
  useEffect(() => setIsActive(false), [isNavActive])
  const [isActive, setIsActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { changeContentType } = useContext(ContentTypeContext)

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
    changeContentType('')
    router.push(`/search/${encodeURIComponent(query)}`)
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
        size={18}
        className="search-icon"
        onClick={toggleActive}
      />
    </div>
  )
}

export default Search
