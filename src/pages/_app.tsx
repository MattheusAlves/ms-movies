import Router from 'next/router'
import { AppProps } from 'next/app'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
//  globall styles
import '@/styles/global.scss'
// context
import { ContentTypeProvider } from '@/contexts/ContentTypeContext'
import { ToWatchListProvider } from '@/contexts/ToWatchListContext'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ContentTypeProvider>
      <ToWatchListProvider>
        <Component {...pageProps} />
      </ToWatchListProvider>
    </ContentTypeProvider>
  )
}

export default MyApp
