'use client'

import BaseLayout from '@/components/layouts/BaseLayout'

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <BaseLayout>
      <main id="main-content" className="page-error" role="alert" tabIndex={-1}>
        <h2>Unable to load this page</h2>
        <p>Please check your connection and try again.</p>
        <button type="button" onClick={reset}>Try again</button>
      </main>
    </BaseLayout>
  )
}
