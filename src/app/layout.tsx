import 'nprogress/nprogress.css'
import '@/styles/global.scss'
import { AppProviders } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  )
}
