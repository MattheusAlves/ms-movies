'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function DetailPoster({ src, title, className }: { src: string; title: string; className: string }) {
  const [failed, setFailed] = useState(false)
  return <Image src={failed ? '/404.png' : src} alt={title} fill sizes="(max-width: 480px) 38vw, (max-width: 700px) 180px, 300px" className={className} preload onError={() => setFailed(true)} />
}
