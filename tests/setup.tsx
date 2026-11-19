import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

// Next enforces this boundary in builds; Vitest executes server modules in Node.
vi.mock('server-only', () => ({}))

// jsdom stubs these Next.js/browser specifics so component tests can render
// real components; individual tests can override with their own vi.mock.
vi.mock('next/image', () => ({
  default: props => {
    const { src, alt = '', width, height, sizes, className, fill, onLoad, loading, fetchPriority } = props
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
        onLoad={onLoad}
        data-fill={fill || undefined}
      />
    )
  }
}))
