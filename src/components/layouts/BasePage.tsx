import { useEffect } from 'react'
import debounce from '@/util/debounce'
interface Props {
  children?: JSX.Element[]
  callback(): void
}

const BasePage = ({ children, callback }: Props): JSX.Element => {
  const onScroll = debounce(e => {
    if (
      e.target.scrollHeight - e.target.scrollTop ===
      document.body.offsetHeight
    ) {
      callback()
    }
  }, 100)

  useEffect(() => {
    const doc = document.getElementsByClassName('base-layout')
    doc[0].addEventListener('scroll', onScroll)
    return () => {
      doc[0].removeEventListener('scroll', onScroll)
    }
  }, [])

  return <div className="base-page">{children}</div>
}

export default BasePage
