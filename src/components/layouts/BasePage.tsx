import { useEffect } from 'react'
import debounce from '@/util/debounce'

interface Props {
  children?: JSX.Element
  callback(): void
}

const BasePage = ({ children, callback = () => null }: Props): JSX.Element => {
  useEffect(() => {
    const doc = document.getElementsByClassName('base-layout')
    console.log(doc)
    doc[0].addEventListener('scroll', onScroll)
    return () => {
      // doc && doc[0] && doc[0].removeEventListener('scroll', onScroll)
    }
  }, [])

  const onScroll = debounce(e => {
    if (
      e.target.scrollHeight - e.target.scrollTop <=
      document.body.offsetHeight
    ) {
      console.log('callback')
      callback()
    }
    console.log('onscrollll')
  }, 100)

  return <div className="base-page">{children}</div>
}

export default BasePage
