import { useReducer, useEffect } from 'react'
import Router from 'next-router'
import debounce from '@/util/debounce'
interface Props {
  children?: React.ReactNode
  callback?: void
}
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { page: state.count + 1 }
    default:
      throw new Error()
  }
}

const BasePage: React.FC = ({ children, callback }) => {
  const [state, dispatch] = useReducer(reducer, { page: 1 })

  const onScroll = debounce(() => {
    console.log('executou')
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      dispatch({ type: 'increment' })
      callback(state.page)
    }
  }, 100)

  useEffect(() => {
    const page = document.getElementsByClassName('base-layout')
    page[0].addEventListener('scroll', onScroll)
    return () => {
      page[0].removeEventListener('scroll', onScroll)
    }
  }, [])

  return <div className="base-page">{children}</div>
}

export default BasePage
