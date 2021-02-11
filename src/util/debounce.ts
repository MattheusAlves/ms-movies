const debounce = (func, wait, page) => {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      console.log('page', page)
      func(page, ...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default debounce
