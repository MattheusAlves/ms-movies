'use client'

import { useContext } from 'react'
import Link from 'next/link'
import BaseLayout from '@/components/layouts/BaseLayout'
import RenderItems from '@/components/shared/RenderItems'
import { ToWatchListContext } from '@/contexts/ToWatchListContext'

export default function WatchlistView() {
  const { toWatchList, storageWarning } = useContext(ToWatchListContext)
  return (
    <BaseLayout>
      <main id="main-content" className="page-shell" tabIndex={-1}>
        <header className="page-heading">
          <div className="heading-row"><h1>Watchlist</h1><p>Your saved movies and series.</p></div>
          <div className="section-rule"><span>Saved titles</span><span>Stored on this device</span></div>
        </header>
        {!toWatchList ? <p className="empty-state" role="status">Loading your watchlist…</p> : toWatchList.length ? (
          <RenderItems data={[{ results: toWatchList }]} />
        ) : storageWarning ? (
          <p className="empty-state">Your watchlist needs attention. See the message below.</p>
        ) : (
          <div className="empty-state"><p>Your watchlist is empty. Save a title to keep it here.</p><Link className="button button--outline" href="/movies">Explore movies</Link></div>
        )}
      </main>
    </BaseLayout>
  )
}
