import { AppProps } from 'next/app'
//  globall styles
import '@/styles/global.scss'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

export default MyApp
