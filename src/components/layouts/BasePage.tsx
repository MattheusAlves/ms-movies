import { useEffect } from 'react'
import debounce from '@/util/debounce'
interface Props {
  children?: JSX.Element
  callback(): void
}

const BasePage = ({ children, callback }: Props): JSX.Element => {
  useEffect(() => {
    const doc = document.getElementsByClassName('base-layout')
    doc[0].addEventListener('scroll', onScroll)
    return () => {
      doc[0].removeEventListener('scroll', onScroll)
    }
  }, [])

  const onScroll = debounce(e => {
    console.log('scroll height', e.target.scrollHeight)
    console.log('scroll top', e.target.scrollTop)
    console.log('offsetHeight', e.target.offsetHeight)
    if (
      e.target.scrollHeight - e.target.scrollTop ===
      document.body.offsetHeight
    ) {
      callback()
    }
  }, 300)

  return <div className="base-page">{children}</div>
}

export default BasePage
