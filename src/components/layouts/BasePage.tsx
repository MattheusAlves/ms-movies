import { useReducer, useEffect } from 'react'
import debounce from '@/util/debounce'
interface Props {
  children?: React.ReactNode
  callback?: void
}
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { page: state.page + 1 }
    default:
      throw new Error()
  }
}

const BasePage: React.FC = ({ children, callback }) => {
  const [state, dispatch] = useReducer(reducer, { page: 1 })

  const onScroll = debounce(
    (page, e) => {
      console.log('scroll top', e.target.scrollTop)
      console.log('scroll height', e.target.scrollHeight)
      console.log('client height', e.target.clientHeight)
      if (
        e.target.scrollHeight - e.target.scrollTop >=
        document.body.offsetHeight
      ) {
        const currentPage = page + 1
        callback(currentPage)
        dispatch({ type: 'increment' })
      }
    },
    200,
    state.page
  )

  useEffect(() => {
    const doc = document.getElementsByClassName('base-layout')
    doc[0].addEventListener('scroll', onScroll)
    return () => {
      doc[0].removeEventListener('scroll', onScroll)
    }
  }, [state.page])

  return <div className="base-page">{children}</div>
}

export default BasePage
