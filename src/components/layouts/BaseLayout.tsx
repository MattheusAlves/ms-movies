import React from 'react'
import Header from '@/components/shared/Header'
import { HeaderContextProvider } from '@/contexts/HeaderContext'

interface Props {
  children?: React.ReactNode
}
const BaseLayout: React.FC = (props: Props) => {
  const { children } = props
  return (
    <div className="base-layout">
      <HeaderContextProvider>
        <Header />
        <div className="elipse eps1" />
        <div className="elipse eps2" />
        <div className="elipse eps3" />
        {children}
      </HeaderContextProvider>
    </div>
  )
}

export default BaseLayout
