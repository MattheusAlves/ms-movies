import { useState } from 'react'
import { useNavigation } from '@/contexts/NavigationContext'

export default function Search({ onNavigate }: { onNavigate?: () => void }): React.JSX.Element {
  const [query, setQuery] = useState('')
  const router = useNavigation()

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    onNavigate?.()
    router.push(`/search/${encodeURIComponent(value)}`)
  }

  return (
    <form className="site-search" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor="site-search">Search movies and series</label>
      <input id="site-search" type="search" placeholder="Search titles" value={query} onChange={event => setQuery(event.target.value)} />
      <button className="search-icon" type="submit" aria-label="Submit search">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      </button>
    </form>
  )
}
