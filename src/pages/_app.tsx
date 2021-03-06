import { AppProps } from 'next/app'
//  globall styles
import '@/styles/global.scss'
// context
import { ContentTypeProvider } from '@/contexts/ContentTypeContext'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ContentTypeProvider>
      <Component {...pageProps} />
    </ContentTypeProvider>
  )
}

export default MyApp
