import type { Metadata } from 'next'
import WatchlistView from './WatchlistView'

export const metadata: Metadata = { title: 'MS - Watchlist' }

export default function WatchlistPage() {
  return <WatchlistView />
}
