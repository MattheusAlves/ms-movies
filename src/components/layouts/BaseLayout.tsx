import React from 'react'

import Header from '@/components/shared/Header'
import Image from 'next/image'
interface Props {
  children?: React.ReactNode
}
const BaseLayout: React.FC<Props> = (props: Props) => {
  const { children } = props
  return (
    <div className="base-layout">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      {children}
      <footer className="site-footer" aria-label="Credits">
        <div className="footer-inner">
          <div className="footer-credit">
            <Image src="/tmdb-logo.svg" width={40} height={29} alt="TMDB logo" />
            <p>This application uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BaseLayout
