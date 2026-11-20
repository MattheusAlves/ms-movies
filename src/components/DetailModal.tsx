'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import DetailContent from '@/app/info/[mediaType]/[mediaId]/DetailContent'
import type { MediaType, TitleDetails } from '@/app/info/[mediaType]/[mediaId]/detail-data'
import fetcher from '@/util/fetcher'
import { endpoint } from '@/config/endpoint'
import { stopNavigationProgress } from '@/util/navigationProgress'
import styles from '@/styles/Media_info.module.scss'

export interface DetailRequest { mediaType: MediaType; mediaId: number }
interface DetailResponse { data: TitleDetails; mediaType: MediaType; imdbRating: number | null }

// Poster and cover links call this opener instead of navigating; without a
// provider (legacy shells) they fall back to plain navigation.
export const DetailModalContext = createContext<((detail: DetailRequest) => void) | null>(null)
export const useOpenDetail = () => useContext(DetailModalContext)

export function DetailModalProvider({ children }: { children: React.ReactNode }) {
  const [detail, setDetail] = useState<DetailRequest | null>(null)
  const open = useCallback((request: DetailRequest) => setDetail(request), [])
  return (
    <DetailModalContext.Provider value={open}>
      {children}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </DetailModalContext.Provider>
  )
}

// Opens instantly on click — no navigation; the title streams in while the
// panel is already visible. The close timeout matches --panel-close.
function DetailModal({ detail, onClose }: { detail: DetailRequest; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const timer = useRef<number>(undefined)
  const { data, error, mutate } = useSWR<DetailResponse>(endpoint.api.detail(detail.mediaType, detail.mediaId), fetcher)

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    setOpen(false)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(onClose, 300)
  }, [closing, onClose])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    stopNavigationProgress()
    panel.current?.focus()
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer.current)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (!data) return
    const previousTitle = document.title
    document.title = `MS - ${data.data.title || data.data.name || 'Untitled'}`
    return () => { document.title = previousTitle }
  }, [data])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key === 'Tab' && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <>
      <div className={styles.modalScrim} data-open={open} onClick={close} aria-hidden="true" />
      <div
        ref={panel}
        className={`${styles.modalPanel} t-panel-slide`}
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
      >
        <button className={styles.modalClose} type="button" aria-label="Close details" onClick={close}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        {error ? (
          <div className="status-message" role="alert">
            <p>Unable to load this title. Please try again.</p>
            <button className="button button--outline" type="button" onClick={() => { void mutate() }}>Retry</button>
          </div>
        ) : !data ? (
          <p className={styles.modalStatus} role="status">Loading details…</p>
        ) : (
          <DetailContent data={data.data} mediaType={data.mediaType} imdbRating={data.imdbRating} modal />
        )}
      </div>
    </>
  )
}
