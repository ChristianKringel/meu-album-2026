import { useState } from 'react'

interface Props {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
}

export default function Avatar({ src, name, size = 'md', className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const sizeClass = SIZE[size]

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-brand-surface flex items-center justify-center font-black text-brand-gold ${className}`}
    >
      {initial}
    </div>
  )
}
