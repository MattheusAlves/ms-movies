import { useEffect } from 'react'
import debounce from '@/util/debounce'

interface Props {
  children?: React.JSX.Element
  callback(): void
}

const BasePage = ({ children, callback = () => null }: Props): React.JSX.Element => {
  useEffect(() => {
    document.addEventListener('scroll', onScroll)
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  const onScroll = debounce(e => {
    if (
      e.target.scrollingElement.scrollTop + window.innerHeight + 200 >=
      e.target.scrollingElement.scrollHeight
    ) {
      callback()
    }
  }, 100)
  return <div className="base-page">{children}</div>
}

export default BasePage
