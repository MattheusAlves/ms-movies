import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

// jsdom stubs these Next.js/browser specifics so component tests can render
// real components; individual tests can override with their own vi.mock.
vi.mock('next/image', () => ({
  default: props => {
    const { src, alt = '', width, height, sizes, className, fill, onLoad } = props
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        onLoad={onLoad}
        data-fill={fill || undefined}
      />
    )
  }
}))
