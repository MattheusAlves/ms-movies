import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

const { useGetTrailer } = vi.hoisted(() => ({ useGetTrailer: vi.fn() }))
vi.mock('@/actions/trailer', () => ({ useGetTrailer }))
import Trailer from '@/components/Trailer'

afterEach(() => { cleanup(); useGetTrailer.mockReset() })

it('loads an eligible YouTube trailer only after the user asks', () => {
  useGetTrailer.mockReturnValue({ data: { results: [
    { key: 'vimeo-id', site: 'Vimeo', type: 'Trailer' },
    { key: 'teaser-id', site: 'YouTube', type: 'Teaser' },
    { key: 'trailer-id', site: 'YouTube', type: 'Trailer' }
  ] } })
  render(<Trailer mediaType="movie" mediaId="1" title="Example" />)
  expect(screen.queryByTitle('Example trailer')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Play trailer/ }))
  expect(screen.getByTitle('Example trailer')).toHaveAttribute('src', 'https://www.youtube.com/embed/trailer-id')
})

it('handles unavailable, invalid, and failed trailer data', () => {
  useGetTrailer.mockReturnValue({ data: { results: [{ key: '../bad', site: 'YouTube' }] } })
  const { rerender } = render(<Trailer mediaType="movie" mediaId="1" title="Example" />)
  expect(screen.getByText('No trailer is available yet.')).toBeInTheDocument()
  useGetTrailer.mockReturnValue({ error: new Error('unavailable') })
  rerender(<Trailer mediaType="movie" mediaId="1" title="Example" />)
  expect(screen.getByText('Trailer information is temporarily unavailable.')).toBeInTheDocument()
})
