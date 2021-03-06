import { useEffect, useContext } from 'react'
import debounce from '@/util/debounce'

import { HeaderContext } from '@/contexts/HeaderContext'

interface Props {
  children?: JSX.Element
  callback(): void
}

const BasePage = ({ children, callback = () => null }: Props): JSX.Element => {
  const { toggleTransparency, transparent } = useContext(HeaderContext)
  useEffect(() => {
    document.addEventListener('scroll', onScroll)
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  const onScroll = e => {
    // console.log(e.target.scrollingElement)
    // console.log(e.target.scrollingElement.scrollHeight)
    console.log(e.target.scrollingElement.scrollTop)
    console.log(window.scrollY)
    // console.log(e.target.scrollingElement.scrollTop + window.innerHeight)
    if (
      e.target.scrollingElement.scrollTop + window.innerHeight + 200 >=
      e.target.scrollingElement.scrollHeight
    ) {
      callback()
    }
    if (window.scrollY > 10) {
      console.log('entrou aqui')
      toggleTransparency(false)
    } else {
      toggleTransparency(true)
    }
  }
  return <div className="base-page">{children}</div>
}

export default BasePage
