import { useState } from 'react'
export default function Img({ src, alt, className='' }) {
  const [bad, setBad] = useState(false)
  if (bad) return <div role="img" aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-brand-200 to-brand-400 text-3xl ${className}`}>👨‍🍳</div>
  return <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={`object-cover ${className}`} />
}
