import { useEffect } from 'react'
import debounce from '@/util/debounce'

interface Props {
  children?: JSX.Element
  callback(): void
}

const BasePage = ({ children, callback = () => null }: Props): JSX.Element => {
  useEffect(() => {
    const doc = document.getElementsByClassName('base-layout')
    doc[0].addEventListener('scroll', onScroll)
    return () => {
      doc && doc[0] && doc[0].removeEventListener('scroll', onScroll)
    }
  }, [])

  const onScroll = debounce(e => {
    if (
      e.target.scrollHeight - e.target.scrollTop <=
      document.body.offsetHeight + 600
    ) {
      callback()
    }
  }, 300)

  return <div className="base-page">{children}</div>
}

export default BasePage
