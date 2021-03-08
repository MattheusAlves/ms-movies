import React, { useContext } from 'react'
import ReactLoading from 'react-loading'

import Header from '@/components/shared/Header'
import { HeaderContextProvider } from '@/contexts/HeaderContext'
import { ContentTypeContext } from '@/contexts/ContentTypeContext'
interface Props {
  children?: React.ReactNode
}
const BaseLayout: React.FC = (props: Props) => {
  const { children } = props
  const { loading } = useContext(ContentTypeContext)
  return (
    <div className="base-layout">
      <HeaderContextProvider>
        <Header />
        <div className="elipse eps1" />
        <div className="elipse eps2" />
        <div className="elipse eps3" />
        {children}
        <div
          className={
            loading ? 'loading-container visible' : 'loading-container'
          }
        >
          <ReactLoading
            type="spinningBubbles"
            color="#4b45ff"
            width="15%"
            height="15%"
            className="loading"
          />
        </div>
      </HeaderContextProvider>
    </div>
  )
}

export default BaseLayout
