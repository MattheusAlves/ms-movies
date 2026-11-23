import NProgress from 'nprogress'

let fallback: ReturnType<typeof setTimeout> | undefined

// A failed or cancelled navigation must not leave the progress bar running.
export function startNavigationProgress() {
  if (fallback) clearTimeout(fallback)
  NProgress.start()
  fallback = setTimeout(stopNavigationProgress, 15000)
}

export function stopNavigationProgress() {
  if (fallback) clearTimeout(fallback)
  fallback = undefined
  NProgress.done()
}
